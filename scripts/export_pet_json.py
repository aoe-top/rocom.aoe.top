from __future__ import annotations

import argparse
import json
import math
import struct
from pathlib import Path
from typing import Any


PRIMITIVE_FORMATS = {
    "EUint32": "<I",
    "EInt32": "<i",
    "EFloat": "<f",
    "EUint64": "<Q",
    "EInt64": "<q",
    "EDouble": "<d",
    "EUint16": "<H",
    "EInt16": "<h",
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_text(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.replace("\x00", "")
    value = "".join(ch for ch in value if ch >= " " or ch in "\t\n\r")
    value = value.strip()
    if not value or "\ufffd" in value:
        return None
    return value


def safe_decode_text(blob: bytes) -> str:
    blob = blob.split(b"\x00", 1)[0]
    if not blob:
        return ""
    try:
        return blob.decode("utf-8")
    except UnicodeDecodeError:
        decoded = blob.decode("utf-8", errors="replace")
        return normalize_text(decoded) or ""


def sanitize_data(value: Any) -> Any:
    if isinstance(value, str):
        return normalize_text(value)
    if isinstance(value, list):
        return [sanitize_data(item) for item in value]
    if isinstance(value, dict):
        return {key: sanitize_data(item) for key, item in value.items()}
    return value


class BinTableParser:
    def __init__(self, bin_root: Path, table_name: str, language: str) -> None:
        self.bin_root = bin_root
        self.table_name = table_name
        self.language = language
        self.schema = read_json(bin_root / "BinConf" / f"{table_name}.json")
        self.properties = self.schema["Properties"]
        self.data = (bin_root / "BinDataCompressed" / f"{table_name}.bytes").read_bytes()
        self.meta = struct.unpack("<" + "I" * 16, self.data[-64:])
        self.row_count = self.meta[3]
        self.struct_size = self.meta[4]
        self.row_index_offset = self.meta[6]
        self.row_index_end = self.meta[9]
        self.ref_count = self.meta[11]
        self.ref_blob_offset = self.meta[12]
        self.ref_blob_length = self.meta[14]
        self.refs = self._load_refs()
        self.localized_refs = self._load_localized_refs()

    def _load_refs(self) -> dict[int, bytes]:
        refs: dict[int, bytes] = {}
        section = self.data[self.row_index_end : len(self.data) - 64]
        expected = self.ref_count * 16
        section = section[:expected]
        for offset in range(0, len(section), 16):
            ref_id, size, blob_offset, _ = struct.unpack("<IIII", section[offset : offset + 16])
            refs[ref_id] = self.data[blob_offset : blob_offset + size]
        return refs

    def _load_localized_refs(self) -> dict[int, bytes]:
        localized_path = self.bin_root / "BinLocalize" / self.language / f"{self.table_name}.bytes"
        if not localized_path.exists():
            return {}
        localized_data = localized_path.read_bytes()
        localized_meta = struct.unpack("<" + "I" * 8, localized_data[-32:])
        index_offset = localized_meta[1]
        ref_count = localized_meta[3]
        section = localized_data[index_offset : index_offset + ref_count * 16]
        refs: dict[int, bytes] = {}
        for offset in range(0, len(section), 16):
            ref_id, size, blob_offset, _ = struct.unpack("<IIII", section[offset : offset + 16])
            refs[ref_id] = localized_data[blob_offset : blob_offset + size]
        return refs

    def iter_row_infos(self) -> list[tuple[int, int, int]]:
        rows: list[tuple[int, int, int]] = []
        section = self.data[self.row_index_offset : self.row_index_offset + self.row_count * 16]
        for offset in range(0, len(section), 16):
            row_key, row_size, row_offset, _ = struct.unpack("<IIII", section[offset : offset + 16])
            rows.append((row_key, row_size, row_offset))
        return rows

    def encoded_size(self, prop: dict[str, Any]) -> int:
        prop_type = prop["Type"]
        if prop_type in PRIMITIVE_FORMATS:
            return struct.calcsize(PRIMITIVE_FORMATS[prop_type])
        if prop_type in {"EBool", "EUint8", "EInt8"}:
            return 1
        if "CompressedSize" in prop:
            return prop["CompressedSize"]
        return prop.get("Size", 4)

    def read_primitive(self, prop_type: str, raw: bytes) -> Any:
        if prop_type == "EBool":
            return raw[0] != 0
        if prop_type == "EUint8":
            return raw[0]
        if prop_type == "EInt8":
            return struct.unpack("<b", raw)[0]
        return struct.unpack(PRIMITIVE_FORMATS[prop_type], raw)[0]

    def decode_ref_blob(self, prop: dict[str, Any], blob: bytes) -> Any:
        prop_type = prop["Type"]
        if prop_type in {"EString", "ELocalizedString"}:
            return safe_decode_text(blob)
        if prop.get("DynamicArray"):
            inner = dict(prop)
            inner.pop("DynamicArray", None)
            if inner["Type"] == "EStruct":
                return self.decode_struct_array(inner["Struct"], blob)
            inner_size = self.encoded_size(inner)
            return [
                self.decode_value(inner, blob[offset : offset + inner_size])
                for offset in range(0, len(blob), inner_size)
                if offset + inner_size <= len(blob)
            ]
        if prop_type == "EStruct":
            struct_def = prop["Struct"]
            if prop.get("ArrayDim", 1) > 1:
                return self.decode_struct_array(struct_def, blob)
            return self.decode_struct(struct_def, blob)
        if len(blob) == self.encoded_size(prop):
            return self.read_primitive(prop_type, blob)
        return {"_raw_hex": blob.hex()}

    def decode_struct(self, struct_def: dict[str, Any], blob: bytes) -> dict[str, Any]:
        result: dict[str, Any] = {}
        cursor = 0
        for prop in struct_def["Properties"]:
            size = self.encoded_size(prop)
            raw = blob[cursor : cursor + size]
            if len(raw) < size:
                break
            result[prop["Name"]] = self.decode_value(prop, raw)
            cursor += size
        return result

    def decode_struct_array(self, struct_def: dict[str, Any], blob: bytes) -> list[dict[str, Any]]:
        item_size = sum(self.encoded_size(prop) for prop in struct_def["Properties"])
        items: list[dict[str, Any]] = []
        for offset in range(0, len(blob), item_size):
            chunk = blob[offset : offset + item_size]
            if len(chunk) < item_size:
                break
            items.append(self.decode_struct(struct_def, chunk))
        return items

    def decode_value(self, prop: dict[str, Any], raw: bytes) -> Any:
        prop_type = prop["Type"]
        if prop_type == "ELocalizedString":
            ref_id = struct.unpack("<I", raw)[0]
            blob = self.localized_refs.get(ref_id)
            return safe_decode_text(blob) if blob is not None else ref_id
        if prop_type == "EString" or prop_type == "EStruct" or prop.get("DynamicArray"):
            ref_id = struct.unpack("<I", raw)[0]
            blob = self.refs.get(ref_id)
            return self.decode_ref_blob(prop, blob) if blob is not None else ref_id
        return self.read_primitive(prop_type, raw)

    def parse_row(self, row_index: int) -> dict[str, Any]:
        row_key, row_size, row_offset = self.iter_row_infos()[row_index]
        row = self.data[row_offset : row_offset + row_size]
        bitmap_bytes = math.ceil(len(self.properties) / 8)
        bitmap = row[:bitmap_bytes]
        present_bits: list[int] = []
        for bitmask in bitmap:
            present_bits.extend((bitmask >> shift) & 1 for shift in range(7, -1, -1))

        result: dict[str, Any] = {"_row_key": row_key, "_row_size": row_size}
        cursor = bitmap_bytes
        for index, prop in enumerate(self.properties):
            if not present_bits[index]:
                continue
            size = self.encoded_size(prop)
            raw = row[cursor : cursor + size]
            cursor += size
            result[prop["Name"]] = self.decode_value(prop, raw)
        return result

    def parse_all(self) -> list[dict[str, Any]]:
        return [self.parse_row(index) for index in range(self.row_count)]


def parse_relevant_tables(bin_root: Path, language: str) -> dict[str, list[dict[str, Any]]]:
    table_names = [
        "PETBASE_CONF",
        "PET_EVOLUTION_CONF",
        "LEVEL_SKILL_CONF",
        "SKILL_CONF",
        "PET_CLASSIS_CONF",
        "PET_TALENT_CONF",
        "PET_BLOOD_CONF",
        "PET_HANDBOOK",
        "PET_EGG_CONF",
        "PET_RANDOM_EGG_CONF",
        "EGG_TYPE_CONF",
        "ACTIVITY_INHERITANCE_CONF",
        "HOME_PET_LAY_EGG_RATE_CONF",
    ]
    parsed: dict[str, list[dict[str, Any]]] = {}
    for table_name in table_names:
        conf_path = bin_root / "BinConf" / f"{table_name}.json"
        data_path = bin_root / "BinDataCompressed" / f"{table_name}.bytes"
        if not conf_path.exists() or not data_path.exists():
            continue
        parser = BinTableParser(bin_root, table_name, language)
        parsed[table_name] = parser.parse_all()
    return parsed


def make_index(rows: list[dict[str, Any]], key: str = "id") -> dict[Any, dict[str, Any]]:
    index: dict[Any, dict[str, Any]] = {}
    for row in rows:
        value = row.get(key)
        if value is not None:
            index[value] = row
    return index


def build_level_skill_payload(level_skill_row: dict[str, Any], skill_index: dict[Any, dict[str, Any]]) -> dict[str, Any]:
    machine_skill_group: list[dict[str, Any]] = []
    for entry in level_skill_row.get("machine_skill_group", []):
        skill_id = entry.get("machine_skill_id")
        skill_info = skill_index.get(skill_id, {})
        machine_skill_group.append(
            {
                "machine_skill_id": skill_id,
                "machine_skill_name": normalize_text(entry.get("machine_skill_name")) or skill_info.get("name"),
                "machine_skill_desc": skill_info.get("desc"),
            }
        )

    payload: dict[str, Any] = {
        "id": level_skill_row.get("id"),
        "editor_name": level_skill_row.get("editor_name"),
        "level": [],
        "machine_skill_group": machine_skill_group,
        "blood_skill": {},
        "legendary_skill": level_skill_row.get("legendary_skill"),
        "legendary_skill_condition": level_skill_row.get("legendary_skill_condition"),
    }

    for entry in level_skill_row.get("level", []):
        skill_id = entry.get("level_gain_skill")
        skill_info = skill_index.get(skill_id, {})
        payload["level"].append(
            {
                "level_point": entry.get("level_point"),
                "stage": entry.get("stage"),
                "skill_id": skill_id,
                "skill_name": skill_info.get("name"),
                "skill_desc": skill_info.get("desc"),
                "param": entry.get("param"),
            }
        )

    blood_skill_fields = [
        "blood_skill_COMMON",
        "blood_skill_GRASS",
        "blood_skill_FIRE",
        "blood_skill_WATER",
        "blood_skill_LIGHT",
        "blood_skill_STONE",
        "blood_skill_ICE",
        "blood_skill_DRAGON",
        "blood_skill_ELECTRIC",
        "blood_skill_TOXIC",
        "blood_skill_INSECT",
        "blood_skill_FIGHT",
        "blood_skill_WING",
        "blood_skill_MOE",
        "blood_skill_GHOST",
        "blood_skill_DEMON",
        "blood_skill_MECHANIC",
        "blood_skill_PHANTOM",
    ]
    for field in blood_skill_fields:
        skill_id = level_skill_row.get(field)
        if not skill_id:
            continue
        skill_info = skill_index.get(skill_id, {})
        payload["blood_skill"][field] = {
            "skill_id": skill_id,
            "skill_name": skill_info.get("name"),
            "skill_desc": skill_info.get("desc"),
        }
    return payload


def build_pet_payload(parsed: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    petbase_rows = parsed.get("PETBASE_CONF", [])
    skill_index = make_index(parsed.get("SKILL_CONF", []))
    level_skill_index = make_index(parsed.get("LEVEL_SKILL_CONF", []))
    evolution_index = make_index(parsed.get("PET_EVOLUTION_CONF", []))

    pets: list[dict[str, Any]] = []
    for petbase in petbase_rows:
        level_skill_conf_id = petbase.get("level_skill_conf_id")
        level_skill_row = level_skill_index.get(level_skill_conf_id)
        pet = {
            "id": petbase.get("id"),
            "name": petbase.get("name"),
            "description": petbase.get("description"),
            "move_type": petbase.get("move_type"),
            "quality": petbase.get("quality"),
            "boss_type": petbase.get("boss_type"),
            "unit_type": petbase.get("unit_type"),
            "ecology_feature": petbase.get("ecology_feature"),
            "model_conf": petbase.get("model_conf"),
            "shining_model_conf": petbase.get("shining_model_conf"),
            "level_skill_conf_id": level_skill_conf_id,
            "pet_feature": petbase.get("pet_feature"),
            "pet_chaos_feature": petbase.get("pet_chaos_feature"),
            "pet_glass_feature": petbase.get("pet_glass_feature"),
            "max_energy": petbase.get("max_energy"),
            "consume_role_hp": petbase.get("consume_role_hp"),
            "pet_score": petbase.get("pet_scroe"),
            "habit_group": petbase.get("belong_habit_group") or petbase.get("pet_habitat_group_role_type"),
            "evolution_ids": petbase.get("pet_evolution_id", []),
            "evolution": [],
            "skills": build_level_skill_payload(level_skill_row, skill_index) if level_skill_row else None,
            "raw": petbase,
        }
        if isinstance(pet["evolution_ids"], list):
            for evolution_id in pet["evolution_ids"]:
                pet["evolution"].append(evolution_index.get(evolution_id, {"id": evolution_id}))
        pets.append(pet)
    return pets


def build_export(parsed: dict[str, list[dict[str, Any]]], bin_root: Path, language: str) -> dict[str, Any]:
    export = {
        "meta": {
            "bin_root": str(bin_root).replace("\\", "/"),
            "language": language,
            "tables": sorted(parsed.keys()),
        },
        "pets": build_pet_payload(parsed),
        "breeding": {
            "pet_egg_conf": parsed.get("PET_EGG_CONF", []),
            "pet_random_egg_conf": parsed.get("PET_RANDOM_EGG_CONF", []),
            "egg_type_conf": parsed.get("EGG_TYPE_CONF", []),
            "activity_inheritance_conf": parsed.get("ACTIVITY_INHERITANCE_CONF", []),
            "home_pet_lay_egg_rate_conf": parsed.get("HOME_PET_LAY_EGG_RATE_CONF", []),
        },
        "tables": parsed,
    }
    return sanitize_data(export)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Parse Data/Bin pet-related tables into JSON.")
    parser.add_argument(
        "--bin-root",
        default="Data/Bin",
        help="Path to the Bin root directory containing BinConf, BinDataCompressed and BinLocalize.",
    )
    parser.add_argument(
        "--language",
        default="zh_CN",
        help="Localization folder name under BinLocalize.",
    )
    parser.add_argument(
        "--output",
        default="output/pet_data.json",
        help="Output JSON file path.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    bin_root = Path(args.bin_root)
    output_path = Path(args.output)
    parsed = parse_relevant_tables(bin_root, args.language)
    export = build_export(parsed, bin_root, args.language)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(export, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {output_path}")
    print(f"Pets: {len(export['pets'])}")
    print(f"Tables: {', '.join(export['meta']['tables'])}")


if __name__ == "__main__":
    main()