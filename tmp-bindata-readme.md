# BinData 文件索引与用途分类

本文档按文件名、JSON 顶层结构、首条记录字段与上下文语义，对 public/data/BinData 目录内配置表进行中文索引与归类。

## 概览
- 文件总数：676
- 常见结构：绝大多数文件使用 RocoDataRows 作为主表，少量文件附带 LocalizationStrings。
- 阅读建议：先按分类定位系统，再查看单文件的用途说明、记录数和首记录字段。

## 分类总览
- 活动、赛季与运营：91 个文件。限时活动、赛季主题、玩法运营、周常与运营专题配置。
- 宠物、魔法与骑乘：86 个文件。宠物主表、孵化进化、骑乘能力、魔法系统与相关专项玩法。
- 战斗、技能与属性：51 个文件。战斗规则、技能效果、Buff、数值判定、属性克制与战斗专用资源。
- NPC、AI 与交互：72 个文件。NPC 主表、行为树、感知、状态机、群组 AI 与交互关系配置。
- 场景、地图与世界探索：57 个文件。场景、区域、区块、地图缩放、天气、传送与世界探索表现配置。
- 任务、剧情与对话：34 个文件。任务流程、对话文本、序列编排、剧情标记与教学内容配置。
- 副本、挑战与竞技：35 个文件。副本、关卡、Boss、PVP、排行榜、竞赛与挑战玩法配置。
- 物品、奖励与背包：31 个文件。物品定义、背包归类、奖励包、掉落、邮件与各类可消耗资源配置。
- 商城、商店与兑换：14 个文件。商城、商店、抽奖、兑换、返利与商品刷新规则配置。
- 时装、家具、家园与生活玩法：45 个文件。外观装扮、家具摆设、家园等级、种植、拍照与生活类玩法配置。
- 角色、成长与数值：21 个文件。角色成长、经验曲线、等级段、品质档位、上限值与成长修正配置。
- 图鉴、收集与称号：10 个文件。图鉴、手册、称号、勋章、收藏奖励与展示页签配置。
- 社交、分享与回归：11 个文件。好友、分享、回流召回、联机展示与社交奖励配置。
- UI、引导与客户端表现：39 个文件。界面布局、引导流程、按钮配置、红点、提示、镜头与展示控制配置。
- 音频、动画、模型与特效：28 个文件。音效、音乐、动画、模型、骨骼、镜头路径、材质与资源挂点配置。
- 系统、平台与调试：28 个文件。全局参数、系统开关、平台兼容、性能分级、反作弊与 GM 调试配置。
- 未归类：23 个文件。需要后续人工复核。

## 文件索引

### 活动、赛季与运营

说明：限时活动、赛季主题、玩法运营、周常与运营专题配置。

- ACT_LIMITTIME_APPEAR.json：活动或赛季玩法中的活动限时出现相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 petbase_id 、 open_world_map 、 option_txt1 、 track_type 、 track_refresh_id_priority 、 track_type_param1 、 option_txt2。
- ACTIVITY_COMMON_SHOW_CONF.json：活动或赛季玩法中的活动通用展示相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 option_id 、 petshow_group。
- ACTIVITY_CONDITION_GROUP_CONF.json：活动或赛季玩法中的活动条件组相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 entire_reward 、 reward_des 、 fashion_bond_id 、 required_part_num 、 part_group 、 dialogue_group。
- ACTIVITY_CONDITION_REWARD_CONF.json：活动条件的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 96 条记录；首记录字段：id 、 part_name 、 condition_group 、 reward_group。
- ACTIVITY_CONF.json：活动或赛季玩法中的活动相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 261 条记录；首记录字段：id 、 activity_type 、 base_id 、 activity_name 、 prompt_text 、 activity_txt 、 appear_time 、 daily_clear_time。
- ACTIVITY_DROP_CONF.json：活动或赛季玩法中的活动掉落相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 59 条记录；首记录字段：id 、 drop_id 、 day_got_limit 、 total_got_limit 、 goods_type 、 goods_id 、 finish_area_tips。
- ACTIVITY_DROP_METHOD_CONF.json：活动或赛季玩法中的活动掉落方式相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 288 条记录；首记录字段：id 、 drop_behavior 、 drop_behavior_condition 、 begin_time 、 end_time 、 area_id 、 world_map_activity_conf_id 、 player_world_type。
- ACTIVITY_FACTION_CONF.json：活动或赛季玩法中的活动阵营相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 select_des 、 cycle_type 、 reset_chance 、 rule_txt 、 task_random_rule 、 faction_group 、 common_task。
- ACTIVITY_FLOWER_APPEAR_CONF.json：活动或赛季玩法中的活动鲜花出现相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 flower_group。
- ACTIVITY_FLOWER_TASK_CONF.json：活动鲜花TASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 46 条记录；首记录字段：id 、 task_type 、 task_conf_id 、 reward_type 、 reward_id。
- ACTIVITY_GLOBAL_CONFIG.json：活动系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 116 条记录；首记录字段：id 、 key 、 editor_name 、 str。
- ACTIVITY_GOODS_CONF.json：活动商品的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 goods_group。
- ACTIVITY_INHERITANCE_CONF.json：活动或赛季玩法中的活动继承相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 day_num 、 pet_whitelist 、 appearance 、 color_type 、 acceleration_date 、 acceleration_rate。
- ACTIVITY_INVITE_REGISTER_CONF.json：活动或赛季玩法中的活动邀请注册相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- ACTIVITY_MAINTAB_CONF.json：活动主页签的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 maintab_name 、 maintab_icon_select 、 maintab_icon。
- ACTIVITY_MIX_CONF.json：活动或赛季玩法中的活动混合相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 114 条记录；首记录字段：id 、 must_do_faction_id 、 go_faction_option_name 、 must_do_task 、 must_do_task_judg 、 go_task_option_name 、 unlock_tips 、 slot_group。
- ACTIVITY_OPTION_CONF.json：活动或赛季玩法中的活动选项相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 79 条记录；首记录字段：id 、 option_type 、 option_param2 、 option_param3 、 option_param4。
- ACTIVITY_PET_CATCH_CONF.json：活动宠物捕捉的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 editor_name 、 first_task_id 、 unlock_task_id 、 points_max 、 reward_group 、 preview_reward_group。
- ACTIVITY_PET_CERTIFICATION.json：活动宠物认证的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 part_name 、 part_desc 、 condition_enum 、 condition_param 、 Intimacy 、 npc_id 、 finish_title。
- ACTIVITY_PET_COLLECTION_CONF.json：活动宠物收藏的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 name 、 reward_id 、 pet_group。
- ACTIVITY_PET_PARTNER_CONF.json：活动宠物伙伴的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 world_level 、 petbase_id 、 egg_id。
- ACTIVITY_PET_PHOTO.json：活动宠物拍照的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 part_name 、 scpart_name 、 goods_type 、 goods_id 、 goods_count 、 package_id1 、 package_id2。
- ACTIVITY_PET_RAISE_CONF.json：活动宠物养成的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 editor_name 、 umg_texture_path 、 unit_type 、 activity_develop_task_conf_id 、 pet_group 、 preview_reward_group 、 task_group。
- ACTIVITY_PET_RAISE_TASK_CONF.json：活动宠物养成TASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 editor_name 、 task_type_name 、 task_type 、 final_task_id 、 task_id 、 icon_normal 、 icon_selected。
- ACTIVITY_PIKA_CONF.json：活动或赛季玩法中的活动皮卡相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 kv_path。
- ACTIVITY_PLAYER_CO_CREATION.json：活动或赛季玩法中的活动玩家协同创作相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 activity_number 、 show_petbase_id 、 track_petbase_id 、 fruit_task_id 、 fruit_reward_id 、 egg_reward_id 、 expend_vitem_type。
- ACTIVITY_PREHEAT_CONF.json：活动或赛季玩法中的活动预热相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 pre_unlock_task 、 option_txt 、 final_task_id 、 reward_id 、 final_task_title 、 final_task_text 、 newspaper_page。
- ACTIVITY_RELAY_PAGE.json：活动或赛季玩法中的活动接力PAGE相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 select_des 、 relay_part_group。
- ACTIVITY_REWARD_BY_STAGE_CONF.json：活动奖励BY阶段的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 start_time 、 end_time 、 reward_group。
- ACTIVITY_SCORE_REWARD_CONF.json：活动积分的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 change_goods_type 、 change_goods_id 、 reward_group。
- ACTIVITY_SHINY_WEEKEND_CONF.json：活动或赛季玩法中的活动闪光周末相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 activity_number 、 petbase_id 、 icon_reward_id 、 shiny_pet_secret 、 shiny_pet_show 、 shiny_pet_preview 、 teaser_txt。
- ACTIVITY_SHOP_CONF.json：活动商店的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 slot_fuction 、 slot_fuction_param 、 activity_shop_id 、 shop_goods_icon 、 shop_goods_txt 、 open_shop_button_txt。
- ACTIVITY_SPEC_FLOWER_SEED_CONF.json：活动或赛季玩法中的活动专属鲜花SEED相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 23 条记录；首记录字段：id 、 editor_name 、 bool_self_selected_flower_seed 、 enum_pet_evo 、 pet_evo_param 、 refresh_group_id 、 enum_star 、 pet_info_id。
- ACTIVITY_SPECIAL_CONF.json：活动或赛季玩法中的活动特殊相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 editor_name。
- ACTIVITY_SPECIAL_TXT_CONF.json：活动或赛季玩法中的活动特殊文本相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 explain_group。
- ACTIVITY_SPRING_FESTIVAL_CONF.json：活动或赛季玩法中的活动春节节日相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 task_conf_id 、 part_0_img 、 global_vitem_task 、 reward_group 、 progressarray。
- ACTIVITY_TASK_GO_CONF.json：活动TASKGO的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 52 条记录；首记录字段：id 、 task_name 、 is_appear_if_finish。
- ACTIVITY_TLOG_CONF.json：活动或赛季玩法中的活动TLOG相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：id 、 activity_id 、 base_id 、 partake_seq_num 、 complete_seq_num 、 partake_prefix 、 complete_prefix 、 partake_event。
- ACTIVITY_TRACK_CONDITION_CONF.json：活动或赛季玩法中的活动追踪条件相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 unopen_option_txt 、 option_open_time 、 option_txt 、 track_type 、 track_type_param1 、 star_rewards 、 petbase_id。
- ACTIVITY_TREASURE_HUNT_CONF.json：活动或赛季玩法中的活动宝藏寻宝相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 subitem_image_path 、 subitem_unlock_image_path 、 subitem_name 、 appear_time 、 lock_time 、 top_up_text 、 area_polygon_id。
- ACTIVITY_UMG_RULE_CONF.json：活动或赛季玩法中的活动UMG相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 67 条记录；首记录字段：id 、 activity_type 、 umg_path。
- ACTIVITY_UP_CONF.json：活动或赛季玩法中的活动提升相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 up_type 、 up_param1。
- ACTIVITY_WEBSITE_PART_CONF.json：活动或赛季玩法中的活动网页部分相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 64 条记录；首记录字段：id 、 part_name 、 note 、 interactive_before_txt 、 website_path 、 if_icon_change 、 callback 、 interactive_after_txt。
- ACTIVITY_WEEKEND_CHALLENGE_CONF.json：活动或赛季玩法中的活动周末挑战相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 group_id 、 entry_a 、 entry_b。
- AONE_FINAL_BATTLE_PETSLIST_CONF.json：AONEFINAL战斗PETSLIST的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：ID 、 monster_id 、 called_dialogue_id 、 keyword。
- BATTLE_PASS_CONF.json：战斗通行证的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 bp_name 、 theme_id 、 top_level 、 loop_level 、 level_name 、 open_time 、 close_time。
- BATTLE_PASS_GIFT_CONF.json：战斗通行证赠礼的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 editor_name 、 editor_gender 、 gender 、 bp_id 、 bp_theme 、 bp_grade 、 gift_goods_id。
- BATTLE_PASS_REWARD_CONF.json：战斗通行证的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 200 条记录；首记录字段：id 、 bp_level 、 belong_reward_set_id 、 bp_id 、 bp_theme_id 、 editor_name 、 need_exp 、 male_free_reward_id。
- BATTLE_PASS_TASK_MODULE_CONF.json：战斗通行证TASKMODULE的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 editor_name 、 task_weight 、 moduel_id。
- BATTLE_PASS_THEME_CONF.json：战斗通行证THEME的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 theme_name 、 theme_desc 、 theme_petbase_id 、 is_alter 、 theme_pet_title 、 theme_art_set 、 special_skills。
- BATTLE_PASS_UI_COLOR.json：战斗通行证界面颜色的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 39 条记录；首记录字段：id 、 editor_name 、 umg_name 、 widget_name 、 color_group。
- BONUS_EVENT_ACCU_POOL_CONF.json：活动或赛季玩法中的奖励事件ACCUPOOL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 38 条记录；首记录字段：id 、 accumulate_type 、 priority 、 max_count 、 accu_times 、 trig_times 、 trig_prob。
- BONUS_EVENT_PETLIST_CONF.json：奖励事件PETLIST的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 350 条记录；首记录字段：id 、 inject_id 、 action_bonus_id 、 petbase_id。
- BONUS_EVENT_POOL_CONF.json：活动或赛季玩法中的奖励事件POOL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 7230 条记录；首记录字段：id 、 accumulate_type 、 enabletime 、 disabletime 、 pool_id 、 bonus_type 、 bonus_param 、 weight。
- BONUS_EVENT_PROB_CONF.json：活动或赛季玩法中的奖励事件PROB相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：id 、 event_id 、 var_type 、 var_param 、 belong_factor_type。
- BONUS_SHINING_STG_CONF.json：活动或赛季玩法中的加成SHININGSTG相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 16 条记录；首记录字段：id 、 expe_strategy 、 is_trig_pity 、 is_clear_count。
- CHEER_POINT_CONF.json：CHEER点数的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 topic 、 pet_type_1 、 cheer_point。
- DAILY_GLOBAL_CONFIG.json：每日系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 key 、 editor_name 、 str。
- DAILY_TASK_REWARD_CONF.json：每日TASK的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 world_level 、 title 、 task_id。
- LEGENDARY_BATTLE_AWARD.json：传奇战斗的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 122 条记录；首记录字段：id 、 name 、 battle_type 、 text 、 condition 、 param1 、 type 、 item_id。
- LEGENDARY_BATTLE_EVENT.json：传奇战斗事件的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 quest_name 、 quest_brief 、 start_time 、 appear_time 、 disappear_time 、 world_level 、 task_id。
- LEGENDARY_GLOBAL_CONFIG.json：传奇系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 55 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- ROGUE_CHALLENGE_GLOBAL_CONFIG.json：ROGUE挑战系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 10 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- ROGUE_LEVEL_CONF.json：活动或赛季玩法中的ROGUELEVEL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 initial_coin 、 monster_level 、 monster_level_growth 、 event 、 node。
- SEASON_ADVENTURE_BADGE_LEVEL.json：活动或赛季玩法中的赛季冒险BADGELEVEL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 group_id 、 level_num 、 next_level 、 badge_icon 、 button_text 、 badge_type_text 、 badge_icon_noedge。
- SEASON_ADVENTURE_CHAPTER.json：活动或赛季玩法中的赛季冒险CHAPTER相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 group_id 、 chapter_type 、 chapter_num 、 next_chapter 、 chapter_name 、 chapter_story_name 、 chapter_story。
- SEASON_ADVENTURE_CONF.json：活动或赛季玩法中的赛季冒险相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 name 、 ui_id 、 chapter_group_id 、 badge_group_id 、 tips_id 、 reward_mail_id 、 shop_id。
- SEASON_ADVENTURE_UI.json：赛季冒险界面的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 theme_color1 、 theme_color2 、 theme_color3 、 theme_color4 、 theme_color5 、 chapter_picture_tips 、 chapter_picture_title1。
- SEASON_BATTLE_RULE_CONF.json：SEASON战斗的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SEASON_CONF.json：活动或赛季玩法中的SEASON相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 part_id 、 start_time 、 end_time 、 s_icon 、 s_title_icon 、 lobby_icon 、 s_title。
- SEASON_GLOBAL_CONFIG.json：SEASON系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 key 、 editor_name 、 numList。
- SEASON_GROWTH_CONF.json：活动或赛季玩法中的SEASONGROWTH相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SEASON_ITEM_CONF.json：活动或赛季玩法中的SEASON物品相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 item_name 、 textbox 、 jump_type 、 jump_param 、 additional_show。
- SEASON_LEGENDARY_BATTLE_EVENT.json：SEASON传奇战斗事件的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 quest_name 、 start_time 、 duration 、 world_level 、 task_id 、 refresh_content_id_1 、 refresh_content_id_2。
- SEASON_PART_CONF.json：活动或赛季玩法中的SEASON部分相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 slot_position 、 red_point_id 、 item_id。
- SEASON_PVE_BASE_CONF.json：活动或赛季玩法中的SEASONPVE基础相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 name 、 legendary_id 、 legendary_pet 、 ticket 、 season_ticket_cost 、 material。
- SEASON_TALENT_CONF.json：活动或赛季玩法中的SEASONTALENT相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SEASON_TIPS_NEW_PET_CONF.json：SEASONTIPSNEW宠物的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 top_text 、 new_pet 、 middle_text 、 new_shiny_pet。
- SEASON_TIPS_PVP_CONF.json：活动或赛季玩法中的SEASONTIPSPVP相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 banner_img 、 pvp_season_id 、 tab_group。
- SEASON_TIPS_TAB_CONF.json：活动或赛季玩法中的SEASONTIPSTAB相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 tips_name 、 tips_icon 、 tab_group。
- SEASON_TIPS_TXT_CONF.json：活动或赛季玩法中的SEASONTIPS文本相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SEASON_TPT_COMMON_CONF.json：活动或赛季玩法中的SEASONTPT通用相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 paragraph_group。
- STAR_AWARD_CONF.json：STAR的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 25 条记录；首记录字段：id 、 title 、 text_1 、 text_2 、 star_amount 、 star_reward 、 show_award。
- TALE_BLOOD_MAGIC_CONF.json：TALE血量魔法的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 page_title 、 unlock_type 、 unlock_param 、 unlock_text 、 unlock_item 、 lock_res 、 unlock_res。
- TALE_NIGHTMARE_CONF.json：活动或赛季玩法中的TALE噩梦相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 title 、 unlock_by_task 、 unlock_text 、 main_res 、 matl_conf 、 task 、 npc_res。
- TALE_NOTEBOOK_KELI_CONF.json：TALENOTEBOOKKELI的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 page_unlock_text 、 page_title 、 page_unlock_by_dia 、 list_title 、 page_black_list_unlock_by_dia 、 black_text 、 unlock_medal。
- TOP_MASTER_CONF.json：活动或赛季玩法中的TOPMASTER相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 name 、 icon_mini 、 icon 、 min_scroe 、 num 、 refresh_reset_type 、 refresh_reset_param。
- WEEKEND_CHALLENGE_GROUP_CONF.json：活动或赛季玩法中的周末挑战组相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 group_name 、 portrait 、 playername 、 level 、 mode 、 teamcode 、 magicid。
- WEEKLY_CHALLENGE_CONF.json：活动或赛季玩法中的每周挑战相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 npc 、 name 、 text 、 sequence_path 、 battle 、 photo 、 weekly_max。
- WEEKLY_CHALLENGE_EVENT_CONF.json：活动或赛季玩法中的每周挑战事件相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 16 条记录；首记录字段：id 、 topic 、 start_time 、 period 、 challenge_id 、 type 、 star_rewards 、 show_reward。
- WEEKLY_PHOTO_CONF.json：活动或赛季玩法中的每周拍照相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 res_name 、 action。

### 宠物、魔法与骑乘

说明：宠物主表、孵化进化、骑乘能力、魔法系统与相关专项玩法。

- ALL_RIDE_PET.json：可骑乘宠物的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 594 条记录；首记录字段：id 、 editor_name 、 animation_name 、 basic_movement_list 、 passive_skill 、 active_skill_list 、 model_scale 、 capsule_half_height。
- ALL_RIDE_UI_CONF.json：可骑乘界面的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 19 条记录；首记录字段：id 、 move_type 、 button_icon 、 button_block_icon 、 button_press_icon 、 off_button_icon 、 off_button_block_icon 、 off_button_press_icon。
- BALL_ACT.json：精灵球活动的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 22 条记录；首记录字段：id 、 editor_name 、 Strength 、 Gravity 、 projectile_friction 、 projectile_friction_disturb 、 can_dive 、 dive_speed_attenuation。
- BALL_CONF.json：精灵球的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 21 条记录；首记录字段：id 、 editor_name 、 model 、 trail_fx 、 fx_source 、 solid_ball_act 、 ball_prob 、 Noeffect_ball_prob。
- CATCH_CONDITION_CONF.json：宠物或魔法系统中的捕捉条件相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 525 条记录；首记录字段：id 、 name 、 des 、 res_id 、 flavor_text 、 max_trigger_time 、 effect_order。
- EGG_TYPE_CONF.json：蛋类型的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：ID 、 display_order 、 ball_range。
- MAGE_CONF.json：魔法师的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 21 条记录；首记录字段：id 、 mage_name 、 lune_name 、 avatar_res 、 unlock_text。
- MAGE_HELP_CONF.json：魔法师帮助的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 468 条记录；首记录字段：id 、 belong_to 、 unlock_by_info 、 npc_model 、 battle_monster 、 help_monster 、 group_battle_npc 、 lengendary_battle_id。
- MAGE_INFO_CONF.json：魔法师的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 61 条记录；首记录字段：id 、 belong_to 、 show_tips 、 text 、 lock_res。
- MAGE_REST_CONF.json：魔法师休息的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：id 、 belong_to 、 mage_npc 、 camp_id 、 mage_rest_select 、 mage_rest_dialogue 、 unlock_by_info 、 unlock_type。
- MAGIC_BASE_CONF.json：魔法基础的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 name 、 localization_id 、 get_path 、 magic_type 、 charge_type 、 vitality_cost_minimum 、 vitality_cost_perscond。
- MAGIC_INTERACT_CONF.json：魔法交互的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 326 条记录；首记录字段：id 、 editor_name 、 action_struct。
- MAGIC_TRANSFORM_CONF.json：魔法变身的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 23 条记录；首记录字段：id 、 is_pet 、 editor_name 、 time 、 model_id 、 use_confirm_panel 、 which_bantype。
- MONSTER_CATCH_CONF.json：MONSTER捕捉的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 2009 条记录；首记录字段：id 、 name 、 Catch_Threshold 、 catch_guarant_rate 、 Catch_Ball_level。
- MONSTER_CONF.json：MONSTER的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 11176 条记录；首记录字段：id 、 name 、 base_id 、 petbase_find_enum 、 find_param 、 monster_level_script 、 new_level 、 difficulty。
- MONSTER_GROWTH_CONF.json：MONSTERGROWTH的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1655 条记录；首记录字段：id 、 difficulty 、 level 、 effort_growth 、 hp_max_mag 、 phy_attack_mag 、 spe_attack_mag 、 phy_defence_mag。
- MONSTER_SKILLBANK_CONF.json：MONSTERSKILLBANK的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 16828 条记录；首记录字段：id 、 level。
- OWL_PET_FRUIT_CONF.json：猫头鹰宠物果实的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 184 条记录；首记录字段：id 、 pet_refresh。
- PET_ACTION_CLOSE_EXP_CONF.json：宠物动作CLOSEEXP的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 30 条记录；首记录字段：id 、 close_exp_action 、 editor_name。
- PET_BAG_SEQUENCE.json：宠物背包序列的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 sequence_default 、 sequence_switch 、 sequence_desc。
- PET_BEHAVIOR_REACTION_CONF.json：宠物行为反应的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 27 条记录；首记录字段：id 、 reaction_random。
- PET_BLOOD_CONF.json：宠物血量的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 blood 、 name 、 blood_type 、 change_blood_action 、 change_to_this_blood_action 、 icon 、 icon_1。
- PET_BOND_COUNT.json：宠物羁绊COUNT的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 14 条记录；首记录字段：id 、 type 、 count。
- PET_BOND.json：宠物羁绊的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 17 条记录；首记录字段：id 、 period_weight 、 default_scale 、 minimum_factor 、 maximum_factor 、 option_id 、 find_gift_option 、 close_level。
- PET_CARRYON_ITEM.json：宠物CARRYON物品的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 editor_name 、 can_cost 、 carryon_skill_type 、 skill。
- PET_CARRYON_UPGRADE.json：宠物CARRYONUPGRADE的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 250 条记录；首记录字段：id 、 editor_name 、 sort_id 、 level 、 carryon_attr。
- PET_CLASSIS_CONF.json：宠物CLASSIS的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 17 条记录；首记录字段：id 、 pet_classis 、 name。
- PET_CLOSE_LEVEL_EFFECT_CONF.json：宠物CLOSELEVEL效果的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 effect_group 、 localization_id。
- PET_CONF.json：宠物的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 6575 条记录；首记录字段：id 、 name 、 base_id 、 pet_info_id。
- PET_EFFORTS_LEVEL.json：宠物EFFORTSLEVEL的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- PET_EGG_CONF.json：宠物蛋的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1623 条记录；首记录字段：id 、 pet_id 、 name 、 model_id 、 weight_low 、 weight_high 、 height_low 、 height_high。
- PET_EGG_WAY_TO_PROB_CONF.json：宠物蛋WAYTOPROB的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 egg_shining_prob_type 、 egg_glass_prob_type。
- PET_EVOLUTION_CONF.json：宠物进化的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 309 条记录；首记录字段：id 、 name 、 allow_show_team_battle_star_array 、 pvp_mute_group 、 evolution_group 、 handbook_evolution_group 、 statistics_evolution_group 、 evolution_chain。
- PET_FEATURE_RAND.json：宠物FEATURERAND的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 feature_rand。
- PET_FILTER_CONF.json：宠物筛选的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 57 条记录；首记录字段：id 、 filter_type 、 filter_enum_name 、 filter_enum_value 、 filter_desc 、 filter_icon。
- PET_FREE_REWARD_CONF.json：宠物免费的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 144 条记录；首记录字段：id 、 free_reward_type 、 free_unlock_data 、 free_reward_id。
- PET_FRUIT_CONF.json：宠物果实的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- PET_GLOBAL_CONFIG.json：宠物系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 349 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- PET_GUARD_CONF.json：宠物守护的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 is_open 、 editor_name 、 mutation_type 、 daily_max_counts 、 reason_white_list 、 ban_func。
- PET_HABIT_CONF.json：宠物HABIT的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- PET_HANDBOOK_REWARD.json：宠物图鉴的图鉴条目、收集顺序或图鉴奖励配置。 结构：RocoDataRows + LocalizationStrings；约 45 条记录；首记录字段：id 、 belong_area_handbook 、 handbook_number 、 handbook_reward。
- PET_HANDBOOK_SEQUENCE.json：宠物图鉴序列的图鉴条目、收集顺序或图鉴奖励配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 sequence_default 、 sequence_switch 、 sequence_desc。
- PET_HANDBOOK.json：宠物图鉴的图鉴条目、收集顺序或图鉴奖励配置。 结构：RocoDataRows + LocalizationStrings；约 347 条记录；首记录字段：id 、 name 、 include_petbase_id 、 belong_area_handbook 、 type_desc 、 description_habitat 、 roco_scale 、 pet_topic。
- PET_HOME_LIMIT_CONF.json：宠物家园限制的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 pet_limit 、 cool_down_offset_lower 、 cool_down_offset_upper。
- PET_INFO_CONF.json：宠物的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1440 条记录；首记录字段：id 、 ball_id 、 glass_prob 、 custom_glass 、 height_percent 、 voice_percent。
- PET_INTERACTION_COMPLEX.json：宠物INTERACTIONCOMPLEX的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 56 条记录；首记录字段：id 、 editor_name 、 interact_cond_group。
- PET_INTERACTION_CONF.json：宠物INTERACTION的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 322 条记录；首记录字段：id 、 editor_name 、 priority 、 weight 、 cond_logic_type 、 interact_cond_group 、 action_type 、 action_param1。
- PET_LEVEL_CONF.json：宠物LEVEL的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 100 条记录；首记录字段：id 、 pet_exp。
- PET_LIKE_ELEMENT_CONF.json：宠物LIKEELEMENT的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 28 条记录；首记录字段：id 、 pet_like_reason 、 editor_name1 、 editor_name2 、 like_elements。
- PET_MARK_CONF.json：宠物标记的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 pet_mark_filter_name。
- PET_NAME_MAP_CONF.json：宠物命名地图的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 598 条记录；首记录字段：id 、 name。
- PET_PARTNER_DATA.json：宠物伙伴的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 143566 条记录；首记录字段：id 、 gopenid_a 、 param_a 、 param_b。
- PET_RANDOM_EGG_CONF.json：宠物随机蛋的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 pet_info_id 、 model_id 、 model_mutation_mat 、 model_mark_tex 、 icon_mutation_mat 、 icon_mark_mat 、 glass_switch。
- PET_REPORT_SCORE_CONF.json：宠物报告积分的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 point 、 perfect_ratio 、 amazing_ratio 、 good_ratio 、 normal_ratio 、 differentblood_ratio 、 bossblood_ratio。
- PET_SCENE_ABILITY_GANZHI.json：宠物SCENEABILITYGANZHI的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 664 条记录；首记录字段：id 、 name 、 npc_id 、 model_id 、 ability_icon 、 map_ability_icon 、 pet_ability_distance。
- PET_SETTLED_BONUS_CONF.json：宠物SETTLED加成的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 bonus_type 、 bonus_desc 、 bonus_rule 、 bonus_pr 、 editor_name1 、 editor_name2 、 param1。
- PET_SHARE_ITEM_CONF.json：宠物分享物品的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1453 条记录；首记录字段：id 、 is_initial_unlock 、 item_quality 、 is_show_unlock。
- PET_SHOW_SPEED_CONF.json：宠物展示速度的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 require_level_min 、 require_level_max 、 grow_time_max 、 individuality_max 、 nature_min 、 nature_max。
- PET_TALENT_CONF.json：宠物天赋的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 91 条记录；首记录字段：id 、 editor_name1 、 editor_name2 、 name 、 desc 、 filter_enum_value 、 condition_group 、 can_add。
- PET_TALENT_RANDOM_CONF.json：宠物天赋随机的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 editor_name 、 talent_ids 、 probability。
- PET_TOPIC_TYPE_CONF.json：宠物TOPIC类型的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 16 条记录；首记录字段：id 、 topic_type 、 show_priority。
- PET_TYPE_SCORE_CONF.json：宠物类型积分的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 type 、 score 、 price 、 defeat_num。
- PET_UI_CAMERA_CONF.json：宠物界面镜头的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 camera_yaobi_len 、 camera_yaobi_pitch。
- PET_WAREHOUSE_CONF.json：宠物WAREHOUSE的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 70 条记录；首记录字段：id 、 warehouse_default_name 、 unlock_rule。
- PETBASE_CONF.json：PETBASE的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1015 条记录；首记录字段：id 、 name 、 boss_type 、 move_type 、 completeness 、 pet_evolution_id 、 quality 、 stength_stage。
- PETBASE_USED_BY_FASHION_BOND.json：PETBASEUSEDBY时装羁绊的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1015 条记录；首记录字段：id。
- PETFREE_CONF.json：PETFREE的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 54 条记录；首记录字段：id 、 petfree_sort 、 level_low 、 level_high 、 reward。
- PETPAGE_BLACKLIST.json：PETPAGE黑名单的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- PLAYER_MAGIC_CONF.json：玩家魔法的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 33 条记录；首记录字段：id 、 skill_id 、 battle_use_time。
- PRIVILEGE_RIDE_CONF.json：PRIVILEGE骑乘的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 privilege_effect 、 petbase_id 、 ride_up_effect 、 ride_down_effect。
- RIDE_ANIMATION.json：骑乘ANIMATION的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：anim_name 、 param_1 、 param_2。
- RIDE_BASIC_MOVEMENT.json：骑乘基础MOVEMENT的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 162 条记录；首记录字段：id 、 editor_name 、 server_move_type 、 vitality_cost。
- RIDE_EFFECTS.json：骑乘EFFECTS的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 981 条记录；首记录字段：id 、 ride_pet_fx_id_group。
- RIDE_PASSIVE_SKILL.json：骑乘PASSIVE技能的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 45 条记录；首记录字段：id 、 type 、 param_1。
- RIDE_SOCKET_EXPORT.json：骑乘SOCKET的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 594 条记录；首记录字段：id 、 editor_name 、 animation_name 、 default_socket_pc1 、 default_socket_pc2 、 socket_mask 、 all_sockets。
- RIDE_SOCKET.json：骑乘SOCKET的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 131 条记录；首记录字段：id 、 editor_name 、 animation_name 、 double_ride_socket_pc1_1p 、 double_ride_socket_pc1_2p 、 double_ride_socket_pc2_1p 、 double_ride_socket_pc2_2p。
- SCENE_ABILITY_ASCENDING_CONF.json：SCENEABILITY上升的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SCENE_ABILITY_CONF.json：SCENEABILITY的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 51 条记录；首记录字段：id 、 ability_name 、 skill_bp_path 、 ability_icon 、 ability_block_icon 、 ability_press_icon 、 scene_ability_slot_cast_type 、 cooldown。
- SCENE_ABILITY_DASH_CONF.json：SCENEABILITY冲刺的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 allow_long_press 、 dash_accelerate 、 dash_acc_curve 、 dash_deacc_curve 、 speed_curve 、 dash_max_speed 、 vitality_id。
- SCENE_ABILITY_FLYING_CONF.json：SCENEABILITY飞行的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SCENE_ABILITY_RIDING_CONF.json：SCENEABILITYRIDING的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SCENE_ABILITY_SLIDING_CONF.json：SCENEABILITY滑翔的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 allow_long_press 、 speed_curve 、 slide_accelerate 、 vitality_cost_curve 、 acc_curve 、 deacc_curve 、 vitality_id。
- SCENE_ABILITY_THROW_CONF.json：SCENEABILITY投掷的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：throw_type 、 id 、 limit_pitch 、 pitch_max 、 pitch_min。
- SUBMIT_PET_CONF.json：SUBMIT宠物的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 48 条记录；首记录字段：id 、 editor_name 、 base_id。
- THROW_FUNC_CONF.json：宠物或魔法系统中的投掷功能相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 throw_function 、 throw_target 、 throw_done 、 retrieve。
- UNCOMMAND_PET_SKILL_CONF.json：UNCOMMAND宠物技能的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：id 、 command_petlv_diff 、 command_percent 、 command_pet_skill 、 command_buff。

### 战斗、技能与属性

说明：战斗规则、技能效果、Buff、数值判定、属性克制与战斗专用资源。

- AI_BATTLE_RESULT_BEHAVIOR.json：AI战斗RESULT行为的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 13 条记录；首记录字段：id 、 editor_name。
- AI_BATTLE_RESULT_CONF.json：AI战斗RESULT的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 44 条记录；首记录字段：id 、 enum_WorldBattleResult 、 enum_WorldNature 、 enum_WorldBattleNPC1 、 enum_WorldBattleNPC2 、 enum_WorldBattleNPC3 、 enum_WorldBattleNPC4。
- ATTR_GLOBAL_CONFIG.json：ATTR系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 65 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- ATTRIBUTE_CONF.json：属性的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 86 条记录；首记录字段：attribute 、 editor_name 、 attribute_name 、 attribute_icon 、 attr_ui_type 、 is_ui_show。
- BASE_POINT_CONF.json：基础点数的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 126 条记录；首记录字段：id 、 base_point。
- BATTLE_CONF.json：战斗的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 4841 条记录；首记录字段：id 、 name 、 type 、 battle_model 、 challanger_unit_num 、 bechallanger_unit_num 、 max_round 、 background_music。
- BATTLE_GLOBAL_CONFIG.json：战斗系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 528 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- BATTLE_GUIDE_CONF.json：战斗引导的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 34 条记录；首记录字段：id 、 battle_lead_group 、 battle_lead_order 、 battle_lead_Finish_type 、 battle_lead_ctrl 、 is_strong_guidance 、 force_termination。
- BATTLE_ITEM_CONF.json：战斗物品的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 34 条记录；首记录字段：id 、 name 、 legally_used_object 、 use_time_in_round 、 resource_usage_path 、 use_effect_type_in_battle 、 effect_value 、 model。
- BATTLE_RANDOM_CONF.json：战斗随机的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 battle。
- BATTLE_RULE_CONF.json：战斗的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 138 条记录；首记录字段：id 、 title 、 desc 、 rank 、 buff 、 icon。
- BATTLE_TYPE_CONF.json：战斗类型的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 26 条记录；首记录字段：ID 、 battle_type 、 name 、 is_open_uncommand 、 is_open_enjoy_hate 、 is_watch_battle 、 is_full_battle_performance。
- BATTLE_USED_BY_TASK_CONF.json：战斗USEDBYTASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 350 条记录；首记录字段：id 、 task_id。
- BLOOD_MONSTER_SKILLBANK_CONF.json：血量MONSTERSKILLBANK的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 232 条记录；首记录字段：id 、 random_type 、 initial_group 、 skill_group_1 、 skill_group_2 、 skill_group_4 、 skill_group_5。
- BST_CONF.json：种族值的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 update_ring_objs_interval 、 ring_bst_limit 、 be_joined_ring_bst_limit 、 ring_cnt 、 ring_limit_rates 、 ring_size_rates 、 sight_extent。
- BUFF_CONF.json：Buff的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 1925 条记录；首记录字段：id 、 editor_name 、 buff_base_ids 、 buff_list_priority 、 buff_groupsigns 、 name 、 type_id 、 add_des。
- BUFF_TYPE.json：Buff类型的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 buff_type_desc 、 buff_type_icon。
- BUFFBASE_CONF.json：BUFFBASE的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 1879 条记录；首记录字段：id 、 editor_name 、 buffbase_order 、 show_letters 、 client_trigger_type 、 buffbase_param。
- COMBAT_MECHANISM_BATTLE_CONF.json：战斗机制战斗的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 combat_teach_train_type 、 data 、 combat_train_order 、 combat_train_display 、 combat_show_reward。
- COMBAT_MECHANISM_TEACH_CONF.json：战斗机制TEACH的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 display_name 、 combat_mechanism_battle。
- ENTERBATTLE_BUFF_PRIORITY.json：ENTERBATTLEBuffPRIORITY的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 27 条记录；首记录字段：id 、 ai_status 、 editor_name 、 buff_coexistence_group。
- HP_MAX_CONF.json：HP上限的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 lower_limit 、 upper_limit。
- LEVEL_SKILL_CONF.json：LEVEL技能的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 881 条记录；首记录字段：id 、 editor_name 、 level 、 machine_skill_group 、 blood_skill_level_point 、 blood_skill_COMMON 、 blood_skill_GRASS 、 blood_skill_FIRE。
- NATURE_CONF.json：环境的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 name 、 is_player_pet_nature 、 positive_effect 、 positive_effect_proportion 、 positive_effect_grow 、 negative_effect 、 negative_effect_proportion。
- POWER_MAX_CONF.json：能量上限的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 lower_limit 、 upper_limit 、 exchange_conf。
- PREATTACK_SKILL.json：PREATTACK技能的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 preattack_tag 、 editor_name 、 preattack_trans_skill_id。
- SKILL_ANIM_SOCKETS_INFO.json：技能动画SOCKETS的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 61543 条记录；首记录字段：id 、 refresh_id 、 model_id 、 skill_id 、 anim_name 、 anim_path 、 socket_name 、 location。
- SKILL_COLOR_CONF.json：技能颜色的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 21 条记录；首记录字段：id 、 unit_type 、 color 、 name 、 JL_background 、 handbook_type_background 、 JL_background_icon 、 JL_background_colour。
- SKILL_CONF.json：技能的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 1378 条记录；首记录字段：id 、 name 、 desc 、 energy_cost 、 dam_para 、 type 、 skill_dam_type 、 skill_feature。
- SKILL_FILTER_CONF.json：技能筛选的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 filter_type 、 filter_enum_name 、 filter_enum_value 、 filter_desc 、 filter_icon。
- SKILL_INTERACT_CONF.json：技能交互的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 26 条记录；首记录字段：id 、 behavior_type 、 RPbehavior_type 、 interact_skill_id。
- SKILL_RANDOM_CONF.json：技能随机的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 editor_name 、 skill_pool。
- SKILL_RES_CHANGE_CONF.json：技能资源CHANGE的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 buff_id 、 res_id。
- SKILL_RES_CONF.json：技能资源的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 345 条记录；首记录字段：id 、 editor_name 、 res_id。
- SKILL_SEQUENCE_CONF.json：技能序列的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 sequence_default 、 sequence_switch 、 sequence_desc。
- SKILL_TAG.json：技能标签的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 14 条记录；首记录字段：id 、 tag 、 condition_skilltype 、 tag_icon。
- SKILL_TIME_CONF.json：技能时序的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 3551 条记录；首记录字段：id 、 skill_path 、 skill_time。
- SKILL_UI_DES.json：技能界面DES的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 ui_des。
- SKILLMACHINE_FILTER_CONF.json：SKILLMACHINEFILTER的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 27 条记录；首记录字段：id 、 filter_type。
- SKILLSPECIAL_CONF.json：SKILLSPECIAL的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SPEC_BATTLE_UI.json：专属战斗界面的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 tips 、 bg 、 bg_icon 、 difficult_group。
- SPECIAL_MOVE_CONF.json：战斗系统中的特殊MOVE相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1443 条记录；首记录字段：id 、 monsterID 、 mutation_diff_type 、 name 、 skill_trigger_type 、 type_param 、 edition_skill_id 、 description。
- TERRITORY_TRIAL_CHALLENGE_CONF.json：战斗系统中的TERRITORYTRIAL挑战相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 topic 、 battle 、 boss 、 boss_point 、 boss_entry 、 guard。
- TERRITORY_TRIAL_CONF.json：战斗系统中的TERRITORYTRIAL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 topic 、 start_time 、 period 、 redirect 、 challenge_id 、 play_reward_text 、 pet_id。
- TYPE_ADVANTAGE_BATTLE_CONF.json：属性克制战斗的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 36 条记录；首记录字段：id 、 type_advantage_train_type 、 data 、 train_order 、 train_display 、 train_show_reward。
- TYPE_ADVANTAGE_TEACH_CONF.json：属性克制TEACH的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 18 条记录；首记录字段：id 、 type_display_name 、 type_icon_resource 、 type_advantage_resource 、 type_advantage_depict 、 list_order 、 unlock_display 、 type_battle_display_name。
- TYPE_DICTIONARY.json：类型字典的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 22 条记录；首记录字段：id 、 type_restraint9 、 type_name 、 short_name 、 evo_bg_path 、 evo_banding_color 、 hint_res 、 tips_res。
- WEAKNESS_CONF.json：WEAKNESS的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 67 条记录；首记录字段：id 、 refresh_content_id 、 editor_name 、 typeweakness_number 、 option。
- WORLD_COMBAT_CONF.json：大世界战斗的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 69 条记录；首记录字段：id 、 npc_id 、 refresh_content_id 、 scene_id 、 world_boss_refer 、 editor_name 、 escape_pos_id 、 block_id。
- WORLD_COMBAT_SKILL_CONF.json：大世界战斗技能的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 172 条记录；首记录字段：id 、 editor_name 、 version_name 、 effective 、 skill_ref。
- WORLD_COMBAT_SKILL_CURVE_CONF.json：大世界战斗技能曲线的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 world_combat_skill_id 、 guid 、 property 、 curve_id。

### NPC、AI 与交互

说明：NPC 主表、行为树、感知、状态机、群组 AI 与交互关系配置。

- AI_MODEL_WARM_CONF.json：AI模型预热的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 nrc_ai_model 、 warm_action_probs_threshold 、 warm_control_attack_ratio 、 warm_control_energy_thr 、 warm_control_attack_th 、 warm_control_restraint_pet 、 warm_control_hurt_thr。
- AI_WORD_CONF.json：AI词条的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 121 条记录；首记录字段：id 、 act_type 、 hint_info。
- BAN_NPC_CONF.json：禁用NPC的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 type 、 allowed_list。
- BEHAVIOR_CONF.json：行为的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 behavior_type 、 action_param1。
- CAMP_CONTENT_NPC_CONF.json：营地内容NPC的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- EMOTION_CONF.json：NPC 或 AI 系统中的情绪相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 34 条记录；首记录字段：id 、 action_res。
- GM_AI_GROUP_CONF.json：GMAI组的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 28 条记录；首记录字段：id 、 ai_group_name 、 ai_group_refresh_array。
- INTERACTIONTREE_CONF.json：交互树的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 name 、 InteractionTreeTypeDefault 、 anim_key2。
- LOCATION_INTERACT_BAN.json：位置交互禁用的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 editor_name 、 locaion_interact_ban_list。
- NPC_ACTION_CONF.json：NPC动作的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 154 条记录；首记录字段：id 、 action_type 、 editor_name 、 client_submit 、 exhausted_content_action。
- NPC_AURA_CONF.json：NPC光环的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 108 条记录；首记录字段：id 、 aura_type 、 aura_area_type 、 aura_distance 、 aura_target_type 、 aura_target 、 aura_effect 、 bound_create_actor。
- NPC_AURA_EFFECT_CONF.json：NPC光环效果的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 13 条记录；首记录字段：id 、 aura_type。
- NPC_CHALLENGE_CONF.json：NPC挑战的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 module_id 、 topic 、 number 、 type 、 level 、 growth 、 rule。
- NPC_CHALLENGE_EVENT_CONF.json：NPC挑战事件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 topic 、 start_time 、 period 、 type 、 rule 、 battle_set 、 star_reward。
- NPC_COMB_OPTION_CONF.json：NPCCOMB选项的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 716 条记录；首记录字段：id 、 editor_name 、 result_id 、 option 、 result_times 、 total_time。
- NPC_COMB_RESULT_CONF.json：NPCCOMBRESULT的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 716 条记录；首记录字段：id 、 editor_name 、 result_struct。
- NPC_COMPASS_OPTION.json：NPCCOMPASS选项的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 146 条记录；首记录字段：id 、 editor_name 、 action。
- NPC_CONF.json：NPC的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 15486 条记录；首记录字段：id 、 genre 、 reward_drop_type 、 name 、 editor_name 、 editor_name_1 、 model_conf 、 icon。
- NPC_FOLLOW_CONF.json：NPC跟随的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 39 条记录；首记录字段：id 、 npc_icon 、 npc_name 、 npc_config_group_id 、 npc_follow_areas 、 task_ids 、 memo 、 hide_start_tips。
- NPC_FOLLOW_TALK_CONF.json：NPC跟随TALK的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 198 条记录；首记录字段：id 、 group_id 、 memo 、 npc_icon 、 npc_name 、 ui_type 、 text 、 text_voice。
- NPC_GLOBAL_CONFIG.json：NPC系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 206 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- NPC_OPTION_CONF.json：NPC选项的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 11258 条记录；首记录字段：id 、 editor_name 、 option_priority 、 option_auto 、 option_radius 、 vision_range 、 npc_interact_type 、 button_icon。
- NPC_PEER_CONF.json：NPC同伴的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 67 条记录；首记录字段：id。
- NPC_PENDANT_CONF.json：NPC挂件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 321 条记录；首记录字段：id 、 type 、 area_type 、 area_id 、 npc_id 、 disable_time 、 distance 、 interact_effect。
- NPC_REACTION_CONF.json：NPC反应的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1276 条记录；首记录字段：id 、 pet_base_id 、 editor_name 、 pet_name 、 npc_reaction_chance 、 npc_group_id 、 reaction_conf。
- NPC_REFRESH_BONUS_CONF.json：NPC刷新加成的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 editor_name 、 event_type 、 event_count_type 、 bonus_type 、 bonus_id 、 is_repeat_bonus 、 probability。
- NPC_REFRESH_CONTENT_CONF.json：NPC刷新内容的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 26106 条记录；首记录字段：id 、 editor_name 、 refresh_type 、 refresh_param 、 max_num 、 storage_num 、 npc_id 、 npc_level_script。
- NPC_REFRESH_GROUP_CONF.json：NPC刷新组的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 201 条记录；首记录字段：id 、 editor_name 、 member_choose_type 、 member_choose_total 、 member_choose_param 、 content_id。
- NPC_REFRESH_RULE_CONF.json：NPC刷新的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 520 条记录；首记录字段：id 、 editor_name 、 refresh_quantity 、 refresh_gap 、 storage_reset_type 、 storage_reset_param 、 delete_quantity 、 delete_gap。
- NPC_REFRESH_TIME_CONF.json：NPC刷新时间的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 available_time。
- NPC_SERVER_REFRESH_CONF.json：NPC服务端刷新的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 enable_time 、 disable_time 、 refresh_reset_type 、 refresh_reset_param 、 refresh_reset_param2 、 delete_reset_type 、 delete_reset_param。
- NRC_AI_BB_INITIATE_CONF.json：NRCAIBBINITIATE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1817 条记录；首记录字段：id 、 blackboard_input。
- NRC_AI_BB_INPUT_CONF.json：NRCAIBBINPUT的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 blackboard_input。
- NRC_AI_BB_INSTANCE_CONF.json：NRCAIBBINSTANCE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 178 条记录；首记录字段：id 、 blackboard_override。
- NRC_AI_BB_NAME_DEFINE_CONF.json：NRCAIBBNAMEDEFINE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 23 条记录；首记录字段：id 、 blackboard_name 、 editor_name 、 bb_type。
- NRC_AI_BEHAVIOR_CONF.json：NRCAI行为的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 2438 条记录；首记录字段：id 、 editor_name 、 belong_to_state 、 tree_name 、 output_key。
- NRC_AI_BEHAVIOR_GROUP_CONF.json：NRCAI行为组的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 25853 条记录；首记录字段：id。
- NRC_AI_CONE_MODER_CONF.json：NRCAICONEMODER的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 editor_name 、 sense_cone_type 、 tod_enum 、 tod_mod_val 、 weather_type 、 weather_mod_val。
- NRC_AI_FSM_COND_CONF.json：NRCAIFSMCOND的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 787 条记录；首记录字段：id 、 name 、 fsm_cond。
- NRC_AI_FSM_STATE_CONF.json：NRCAIFSMSTATE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 138 条记录；首记录字段：id 、 editor_name 、 state_type 、 level 、 fsm_state。
- NRC_AI_FSM_STRUCTURE_CONF.json：NRCAIFSMSTRUCTURE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 27 条记录；首记录字段：id 、 annotation 、 start_state_id 、 state_id。
- NRC_AI_GAMEPLAY_STATE_CONF.json：NRCAIGAMEPLAYSTATE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 native_class 、 str_param 、 editor_name。
- NRC_AI_GAMEPLAY_STATETRANS_CONF.json：NRCAIGAMEPLAYSTATETRANS的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 from_state 、 to_state 、 via_state 、 interruptible。
- NRC_AI_GAMEPLAY_TAG_CONF.json：NRCAIGAMEPLAY标签的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 tag_name 、 editor_name。
- NRC_AI_GLOBAL_CONFIG_CONF.json：NRCAI系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 22 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- NRC_AI_GROUP_INFO_CONF.json：NRCAI组的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1817 条记录；首记录字段：id 、 editor_name 、 fsm_struct_id 、 visual_id 、 audio_id 、 mod_id 、 cone_ids 、 bb_input。
- NRC_AI_OVERWRITE_BEHAVIOR_CONF.json：NRCAIOVERWRITE行为的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 779 条记录；首记录字段：id 、 behavior_group。
- NRC_AI_PERCEPTION_AUDIO_CONF.json：NRCAIPERCEPTION音频的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1810 条记录；首记录字段：id 、 hearing_radius 、 perceiving_threshold。
- NRC_AI_PERCEPTION_MODER_CONF.json：NRCAIPERCEPTIONMODER的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1810 条记录；首记录字段：id 、 tod_enum 、 tod_visual_factor 、 weather_type 、 weather_visual_factor。
- NRC_AI_PERCEPTION_VISUAL_CONF.json：NRCAIPERCEPTIONVISUAL的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1810 条记录；首记录字段：id 、 visual_near 、 visual_medium 、 visual_far 、 visual_angle。
- NRC_AI_PERFORM_POOL_CONF.json：NRCAI表现POOL的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 598 条记录；首记录字段：id 、 name 、 param1 、 pool_number 、 ai_perform_group_1 、 ai_group_param_1 、 ai_perform_group_2 、 ai_group_param_2。
- NRC_AI_PERFORM_SKILL_CONF.json：NRCAI表现技能的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 234 条记录；首记录字段：id 、 editor_name 、 skill_ref。
- NRC_AI_RELATION_SCHEMA_CONF.json：NRCAIRELATIONSCHEMA的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：id 、 editor_name 、 role_schema。
- NRC_AI_SENSE_CONE_CONF.json：NRCAISENSECONE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 34 条记录；首记录字段：id 、 editor_name 、 sense_cone_type 、 start_angle 、 end_angle 、 percep_radius 、 height_modify 、 percep_rate。
- NRC_AI_SENSE_EVENT_CONF.json：NRCAISENSE事件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 72 条记录；首记录字段：id 、 editor_name 、 sense_event_type 、 event_sub_type 、 bb_pos_name。
- NRC_AI_WORLD_COMBAT_SKILL_CONF.json：NRCAI大世界战斗技能的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 editor_name 、 skill_ref 、 option。
- NRC_AI_WORLD_EVENT_CONF.json：NRCAIWORLD事件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 10 条记录；首记录字段：id 、 editor_name 、 spread_dis 、 bb_pos_name。
- NRC_GROUP_AI_BASIC_INFO_CONF.json：NRC组AI基础的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 169 条记录；首记录字段：id 、 editor_name 、 event_array。
- NRC_GROUP_AI_BEHAVIOR_CONF.json：NRC组AI行为的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 596 条记录；首记录字段：id 、 editor_name 、 behavior_type 、 behavior_ids 、 exec_type。
- NRC_GROUP_AI_DISMISS_CONF.json：NRC组AIDISMISS的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- NRC_GROUP_AI_DYNAMIC_EVENT_CONF.json：NRC组AIDYNAMIC事件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- NRC_GROUP_AI_EVENT_CONF.json：NRC组AI事件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 597 条记录；首记录字段：id 、 editor_name 、 group_event_type 、 spread_type 、 spread_param 、 group_ai_role_type_limit 、 spread_limit_status 、 expire_type。
- NRC_GROUP_AI_MOVE_CONF.json：NRC组AIMOVE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 editor_name 、 station_param 、 move_center_type 、 center_param。
- NRC_GROUP_AI_ROLE_TYPE_CONF.json：NRC组AIROLE类型的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 137 条记录；首记录字段：id 、 group_ai_role_type_name。
- NRC_GROUP_AI_STATION_CONF.json：NRC组AISTATION的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 51 条记录；首记录字段：id 、 editor_name 、 station_param 、 center_param 、 individual_orinentation。
- NRC_HOME_AI_CONF.json：NRC家园AI的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 79 条记录；首记录字段：id 、 editor_name 、 cell_ai_group_param 、 detecting_cd 、 detecting_cd_float 、 successful_detection_cd 、 successful_cd_float_detection 、 initiator_role_id。
- OWL_CONTENT_NPC_CONF.json：猫头鹰内容NPC的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 554 条记录；首记录字段：id 、 editor_name 、 refresh_num_max 、 is_land_pet 、 refresh_content_num 、 pet_owl_content_advanced_persent 、 refresh_max_num 、 refresh_storage_num。
- PERFORM_CONF.json：表现的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 skill_path 、 performer 、 commands。
- READ_CONF.json：NPC 或 AI 系统中的阅读相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 142 条记录；首记录字段：id 、 read_type 、 text。
- ROLEPLAY_BEHAVIOR_CONF.json：ROLEPLAY行为的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 60 条记录；首记录字段：id 、 name_text 、 behavior_type 、 RPbehavior_type 、 range 、 star 、 toast_text 、 ui_order。
- ROLEPLAY_PROP_CONF.json：NPC 或 AI 系统中的ROLEPLAYPROP相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 name_text 、 interactive_prop_chat_message_type 、 message_group 、 icon_path 、 prop_server_radius 、 lift_box 、 prop_recycle_distance。
- ROLEPLAY_SORT_CONF.json：NPC 或 AI 系统中的ROLEPLAYSORT相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 tab_name 、 behavior_type 、 tab_icon1 、 tab_icon2。

### 场景、地图与世界探索

说明：场景、区域、区块、地图缩放、天气、传送与世界探索表现配置。

- AREA_CHECK_CONF.json：区域CHECK的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- AREA_CONF.json：区域的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 32306 条记录；首记录字段：id 、 scene_res_id 、 scene_id 、 area_type 、 area_layer 、 pos 、 center_xyz。
- AREA_FUNC_CONF.json：区域功能的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 462 条记录；首记录字段：id 、 editor_name 、 area_id 、 world_map_name_scale 、 name_priority 、 battle_source 、 bgm_id 、 switch_group_name。
- AREA_GROUP_CONF.json：区域组的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 14 条记录；首记录字段：id 、 area_id。
- AREA_HANDBOOK.json：区域图鉴的图鉴条目、收集顺序或图鉴奖励配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 name 、 area_handbook_type 、 collected_red_point_id 、 topic_red_point_id 、 count_reward_handbook_red_point_id 、 icon 、 bg_name。
- AREA_SCENEOBJ_CONF.json：区域场景物体的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- AREA_TAG_CONF.json：区域标签的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 25 条记录；首记录字段：id 、 editor_name 、 field_type 、 field_layer。
- AREA_TRIG_CONF.json：区域触发的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 area_id。
- AREA_UI_CONF.json：区域界面的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- AREA_VISIBLE_CONF.json：区域可见的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 180 条记录；首记录字段：id 、 editor_name 、 editor_name1 、 visible_type 、 area_visible_density 、 area_visible_player_num 、 area_visible_merge_num 、 area_visible_priority。
- AREA_WEATHER_CONF.json：区域天气的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 115 条记录；首记录字段：id 、 rand_weather。
- BLOCK_CONF.json：区块的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 204 条记录；首记录字段：block_up_height 、 block_down_height 、 is_block_detection 、 id 、 AirWallSerPosition 、 position 、 rotation 、 scale。
- ENV_TAG_CONF.json：场景与世界探索中的ENV标签相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 25 条记录；首记录字段：id 、 env_tag 、 mask_name 、 env_temp 、 physical_surface 、 top_surface。
- EQS_BOX_EXPORT.json：场景与世界探索中的EQSBOX相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 prop_eqs_box。
- FIELD_LAYER_CONF.json：场景与世界探索中的地表层相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 power_up 、 res_id。
- HABITAT_CONF.json：场景与世界探索中的栖息地相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 76 条记录；首记录字段：id 、 mid_position 、 belong_camp。
- LAYERED_WORLD_MAP_CONF.json：分层世界地图的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 map_layer_group 、 map_sort_order 、 map_layer_icon_select 、 map_layer_icon_unselected 、 display_name 、 belong_camp 、 scene_res_id。
- LINE_CONF.json：线路的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- MAP_GLOBAL_CONFIG.json：地图系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 87 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- MAP_INFO_BAR_CONF.json：地图信息条的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 icon 、 text 、 map_element 、 red_point_key 、 display_condition。
- MEGAMAP_CLASS_NAME_CONF.json：大地图CLASSNAME的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 10 条记录；首记录字段：id 、 class 、 name。
- MEGAMAP_CONF.json：大地图的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 827 条记录；首记录字段：id 、 genre 、 class 、 display_level_min 、 display_level_max。
- MEGAMAP_GATHERING_CONF.json：大地图GATHERING的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 2595 条记录；首记录字段：id 、 index_method 、 param_id 、 genre。
- MEGAMAP_MAP_CONF.json：大地图的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 name 、 english_name 、 range_a 、 range_b 、 path 、 grid_size 、 grid_offset。
- MEGAMAP_OVERLAP_CONF.json：大地图重叠的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 18 条记录；首记录字段：id 、 res_class_id 、 res_enum_id 、 name 、 icon。
- MEGAMAP_REFRESH_BLACKLIST.json：大地图刷新黑名单的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id。
- MEGAMAP_SPEED_CONF.json：大地图速度的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 speed。
- POINT_CONF.json：点数的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- REGION_CONF.json：区域的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 pet_id 、 region_id 、 name 、 next_region 、 region_start_chapter 、 magic_manual_switch_img1 、 magic_manual_switch_img2。
- SCENE_AWARD_CONF.json：SCENE的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 32 条记录；首记录字段：id 、 actor_name 、 area_id 、 drop_hight 、 drop_ring_inner 、 drop_ring_outer 、 award。
- SCENE_CONF.json：SCENE的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 76 条记录；首记录字段：id 、 editor_name 、 scene_name 、 scene_res_id 、 scene_load_type 、 born_pos_x 、 born_pos_y 、 born_pos_z。
- SCENE_EFFECT_CONF.json：场景特效的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 type 、 area_id。
- SCENE_ENTER_EXIT.json：场景出入的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 35 条记录；首记录字段：id 、 scene_id 、 scene_res_id 、 enter_content 、 exit_content。
- SCENE_OBJECT_AWARD.json：场景物体的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 1684 条记录；首记录字段：id 、 editor_name 、 scene_cfg_id 、 object_index 、 heightmap_xy 、 position_xyz 、 rotation_xyz 、 scale_xyz。
- SCENE_OBJECT_CONF.json：场景物体的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 314 条记录；首记录字段：id 、 editor_name 、 scene_cfg_id 、 scene_res_conf_id 、 scene_export_id 、 object_index 、 heightmap_xy 、 position_xyz。
- SCENE_PLAYER_STATUS_MATRIX.json：SCENE玩家状态矩阵的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 status_type 、 op_code。
- SCENE_RES_CONF.json：场景资源的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 102 条记录；首记录字段：id 、 editor_name 、 sub_scene_res_list 、 scene_id 、 scene_export_id 、 task_scene_group 、 scene_res_name 、 source。
- SCENE_STATUS_SALS_CONF.json：SCENE状态SALS的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 61 条记录；首记录字段：id 、 player_sals 、 sals_status_name。
- SCENE_STATUS_WPST_CONF.json：SCENE状态WPST的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 player_wpst 、 wpst_status_name 、 is_not_afk_wpst 、 look_at_block_list。
- SEAT_CONF.json：场景与世界探索中的座位相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 seat_num。
- SPLINE_CONF.json：SPLINE的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 357 条记录；首记录字段：id 、 position 、 rotation 、 scale 、 bp_name 、 spline_point。
- TELEPORT_CONF.json：TELEPORT的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 383 条记录；首记录字段：id 、 editor_name 、 teleport_actor_types 、 teleport_begin_point_type 、 teleport_dest_type 、 teleport_dest 、 teleport_dest_online。
- TELEPORT_LOADING_CONF.json：TELEPORT加载的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 45 条记录；首记录字段：id 、 editor_name 、 loading_begin 、 loading_end 、 res_path。
- TELEPORT_RULES_CONF.json：TELEPORTRULES的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 editor_name 、 range 、 deviation 、 towards 、 fail_add_z。
- TOD_CONF.json：场景与世界探索中的TOD相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 tod_enum 、 available_time 、 temp。
- WEATHER_CONF.json：天气的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 13 条记录；首记录字段：id 、 weather_type 、 name 、 weather_params 、 tod_param 、 temperature 、 weather_buff 、 report_tip。
- WIND_GRASS.json：场景与世界探索中的风草地相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 aura_id 、 location_z。
- WORLD_EXPLORING_STATISTIC_CONF.json：场景与世界探索中的世界探索STATISTIC相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 display_name 、 map_order 、 option。
- WORLD_MAP_ACTIVITY_CONF.json：世界地图活动的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 23 条记录；首记录字段：id 、 world_map_id 、 radius。
- WORLD_MAP_AREA_GUIDE.json：世界地图区域引导的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 tips 、 area_func_id 、 camp_content_id 、 reward 、 map_guide_type 、 title_bg 、 png_1。
- WORLD_MAP_BLOCK_CONF.json：世界地图区块的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 scene_res_id 、 list_order 、 list_name 、 min_scale 、 max_scale 、 map_switch_fix_point 、 para1。
- WORLD_MAP_CHALLENGE_CONF.json：世界地图挑战的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 166 条记录；首记录字段：id 、 show_reward。
- WORLD_MAP_CONF.json：世界地图的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 1188 条记录；首记录字段：id 、 name_area_id 、 zone_name 、 camp_refresh_id 、 element_show_scale 、 zone_name_roco 、 pet_base_id。
- WORLD_MAP_GLOBAL_CONF.json：世界地图全局的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 key 、 num。
- WORLD_MAP_SCALE_CONF.json：世界地图SCALE的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 max_scale。
- WORLD_ZONE_CONF.json：世界分区的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- ZONE_EFFECT_CONF.json：分区效果的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。

### 任务、剧情与对话

说明：任务流程、对话文本、序列编排、剧情标记与教学内容配置。

- ALL_DIALOGUE_EN.json：全量对话EN的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- DESC_NOTE_CONF.json：说明备注的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 186 条记录；首记录字段：id 、 note 、 desc。
- DIALOGUE_CONF.json：对话的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 40449 条记录；首记录字段：id 、 editor_name 、 dialogue_sound 、 action。
- DIALOGUE_ONLY_OPTION_CONF.json：对话仅选项的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 3961 条记录；首记录字段：id。
- DIALOGUE_ORDER_CONF.json：对话顺序的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 56 条记录；首记录字段：id 、 first_level_area_name 、 first_level_area_name_rank 、 journey_plot_id 、 journey_plot_id_rank 、 journey_plot_name 、 journey_area_name 、 journey_area_name_rank。
- DIALOGUE_USED_BY_TASK_CONF.json：对话USEDBYTASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 12810 条记录；首记录字段：id 、 task_id。
- FUNCTION_STORY_FLAG_CONF.json：任务与剧情系统中的FUNCTION剧情FLAG相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 413 条记录；首记录字段：id 、 editor_name。
- HOME_USED_BY_TASK_CONF.json：家园USEDBYTASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 task_id。
- MOVIE_USED_BY_TASK_CONF.json：过场USEDBYTASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 32 条记录；首记录字段：id 、 task_id。
- OPTION_USED_BY_TASK_CONF.json：选项USEDBYTASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 992 条记录；首记录字段：id 、 task_id。
- PARAGRAPH_CONF.json：段落的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 338 条记录；首记录字段：id 、 sorthels 、 show_task_start 、 title 、 description。
- PARAGRAPH_PACKAGE_ORDER_CONF.json：段落套包顺序的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 paragraph_id。
- PARAGRAPH_VO_CONF.json：段落语音的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 319 条记录；首记录字段：id 、 paragraph_id 、 audio_id。
- SEQUENCE_CONF.json：任务与剧情系统中的序列相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 118 条记录；首记录字段：id 、 editor_name 、 sequence_path 、 act_x 、 act_y 、 act_z 、 is_hide_npc 、 scene_id。
- SEQUENCE_USED_BY_TASK_CONF.json：序列USEDBYTASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 81 条记录；首记录字段：id 、 task_id。
- STORY_BGM_CONF.json：剧情BGM的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 story_bgm_state 、 text。
- SUB_EVENTS_CONF.json：任务与剧情系统中的SUBEVENTS相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 name 、 user_subscribe_type 、 channel 、 user_subscribe_tpl_type 、 send_scene 、 sample 、 text。
- SUB_TASK_CONF.json：SUBTASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- SUB_TPLS_CONF.json：任务与剧情系统中的SUBTPLS相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 channel 、 user_subscribe_tpl_type 、 tpl_name 、 plat_tpl_id 、 plat_event_id 、 daily_limit 、 cd。
- TASK_CONF.json：TASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 3729 条记录；首记录字段：id 、 name 、 task_class 、 paragraph_id 、 task_structure_type 、 task_condition 、 go_guide 、 auto_finish。
- TASK_DATA_GUARD_CONF.json：TASK守护的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 37 条记录；首记录字段：id 、 option_id 、 npc_id 、 content_id。
- TASK_DIALOGUE_EN.json：任务对话EN的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- TASK_GLOBAL_CONFIG.json：任务系统全局系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 35 条记录；首记录字段：id 、 key 、 editor_name 、 numList。
- TASK_ITEM.json：TASK物品的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 bag_item_id 、 task_type。
- TASK_MODULE_CONF.json：TASKMODULE的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 115 条记录；首记录字段：id 、 task_weight 、 moduel_id。
- TASK_NPC.json：TASKNPC的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- TASK_PET_PARAM_CONF.json：TASK宠物PARAM的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：id 、 editor_name 、 task_group。
- TASK_STATE_CONF.json：TASKSTATE的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 state_areas 、 begin_tips 、 end_tips 、 state_type 、 effect_begin 、 effect_loop 、 effect_end。
- TASK_STYLE_CONF.json：TASKSTYLE的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 icon_open 、 icon_wait 、 icon_done 、 sub_icon_open 、 sub_icon_done 、 minimap_open 、 minimap_wait。
- TASK_SUMMARY.json：任务摘要的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 14 条记录；首记录字段：id 、 show_paragraph 、 task_name 、 task_des 、 sequence_res 、 res_conf 、 pc_action 、 pc_pos。
- TASK_SWITCH_CONF.json：TASKSWITCH的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 switch_group_id 、 switch_type 、 begintask 、 switch_condition。
- TASK_TOKEN_CONF.json：TASKTOKEN的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 name 、 token_des 、 token__source 、 token_reward。
- TEACH_CONF.json：任务与剧情系统中的TEACH相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 118 条记录；首记录字段：id 、 list_type 、 list_des 、 guide_struct 、 unlock_conditions 、 unlock_icon 、 unlock_text_main 、 unlock_text_sub。
- TEACH_TAB_CONF.json：任务与剧情系统中的TEACHTAB相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 type 、 type_name 、 icon1 、 icon2。

### 副本、挑战与竞技

说明：副本、关卡、Boss、PVP、排行榜、竞赛与挑战玩法配置。

- ADVENTURE_CONF.json：副本或竞技玩法中的ADVENTURE相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 pet_id 、 chapter_num 、 next_chapter 、 chapter_name 、 chapter_story_name 、 chapter_picture 、 chapter_story。
- BOSS_CHALLENGE_CONF.json：副本或竞技玩法中的Boss挑战相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 topic 、 number 、 type 、 level 、 growth 、 rule 、 description。
- BOSS_CHALLENGE_EVENT_CONF.json：副本或竞技玩法中的Boss挑战事件相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 topic 、 petbase 、 start_time 、 period 、 type 、 rule 、 buff。
- BOSS_SKILLS_MAP_CONF.json：BossSKILLS地图的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 162 条记录；首记录字段：id 、 refresh_id 、 npc_id 、 preload_distance 、 skill_ids 、 anim_names。
- CARD_ADVENTURE_RECORD_CONF.json：卡片ADVENTURERECORD的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 text 、 icon 、 adventure_record。
- CHALLENGE_GLOBAL_CONF.json：副本或竞技玩法中的挑战全局相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- CHAPTER_CONF.json：副本或竞技玩法中的CHAPTER相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 title。
- CLIMB_CHAPTER_CONF.json：副本或竞技玩法中的爬塔CHAPTER相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 13 条记录；首记录字段：id 、 name 、 stage。
- DUNGEON_CONF.json：副本或竞技玩法中的副本相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 68 条记录；首记录字段：id 、 name 、 region_name 、 scene_id 、 world_scene_id 、 type 、 type_name 、 hide_tag。
- DUNGEON_STAGE.json：副本或竞技玩法中的副本阶段相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 69 条记录；首记录字段：id 、 dungeon_id 、 stage_name 、 start_condition 、 finish_condition 、 revive_point。
- GP_CONTEST_CONF.json：GPCONTEST的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 contest_list。
- NIGHTMARE_ELITE_CONF.json：副本或竞技玩法中的噩梦ELITE相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 820 条记录；首记录字段：id 、 editor_name 、 model_scale 、 nightmare_basehp__mag 、 nightmare_shield_mag 、 phy_attack_mag 、 spe_attack_mag 、 phy_defence_mag。
- PVP_AWARD_CONF.json：PVP的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 range 、 condition 、 condition_para1。
- PVP_BATTLE_SCORE_CONF.json：PVP战斗积分的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 13 条记录；首记录字段：id 、 score1。
- PVP_CONF.json：副本或竞技玩法中的PVP相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 sequence 、 name 、 des 、 npcid 、 npc_icon 、 banner 、 icon。
- PVP_MATCH_TIPS_CONF.json：PVPMATCHTIPS的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 pvp_match_tips_text。
- PVP_RANDOM_PET_LIBRARY_CONF.json：PVP随机宠物LIBRARY的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 174 条记录；首记录字段：id 、 pet_type 、 expand_pet 、 level。
- PVP_RANDOM_PET_REWARD_CONF.json：PVP随机宠物的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 27 条记录；首记录字段：id 、 random_pet 、 star。
- PVP_RANDOM_SKILL_LIBRARY_CONF.json：PVP随机技能LIBRARY的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 16 条记录；首记录字段：id 、 random_type 、 skill_lists 、 skill_site 、 battle_type。
- PVP_RANDOM_SKILL_LIST_CONF.json：PVP随机技能的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 59 条记录；首记录字段：id 、 skills。
- PVP_RANK_CONF.json：副本或竞技玩法中的PVP排位相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 117 条记录；首记录字段：id 、 name 、 name_only 、 icon 、 number 、 icon_mini 、 star_num 、 star_total。
- PVP_RANK_PLAYER_POLL_CONF.json：副本或竞技玩法中的PVP排位玩家POLL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 new_player_score 、 max_score 、 new_player_fight_num_robot 、 new_player_fight_win_num_robot 、 new_player_fight_num 、 new_player_fight_win_num 、 player_pet。
- PVP_RANK_RANDOM_PET_CONF.json：PVP排位随机宠物的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 174 条记录；首记录字段：id 、 pet_type 、 expand_pet 、 level。
- PVP_RANK_ROBOT_CARD_ICON_CONF.json：PVP排位机器人卡片图标的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id。
- PVP_RANK_ROBOT_NAME_CONF.json：副本或竞技玩法中的PVP排位机器人NAME相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 166 条记录；首记录字段：id 、 name。
- PVP_RANK_ROBOT_PLAYER_CONF.json：副本或竞技玩法中的PVP排位机器人玩家相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 10 条记录；首记录字段：id 、 npc 、 gender 、 fashion。
- PVP_RANK_SEASON_CONF.json：副本或竞技玩法中的PVP排位SEASON相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 18 条记录；首记录字段：id 、 name 、 start_time 、 end_time1 、 end_time2 、 reward_list。
- PVP_RANK_TRIAL_PET_CONF.json：PVP排位TRIAL宠物的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 497 条记录；首记录字段：id 、 baseid 、 pet_info_id 、 level。
- PVP_RANK_TRIAL_PET_LIBRARY_CONF.json：PVP排位TRIAL宠物LIBRARY的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 unit_type 、 pet。
- PVP_RANK_WEEK_TASK_CONF.json：PVP排位WEEKTASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 num 、 reward。
- PVP_ROBOT_CONF.json：副本或竞技玩法中的PVP机器人相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 star_total_range 、 losing_streak 、 ai_model_id 、 new_day_percent_robot 、 battle_type。
- PVP_WAREHOUSE_CONF.json：副本或竞技玩法中的PVPWAREHOUSE相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 star_rank_upper 、 battle_id。
- STAGE_CONF.json：副本或竞技玩法中的阶段相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 65 条记录；首记录字段：id 、 name 、 next_id 、 battle_id 、 show_reward_id 、 STAGE_introduce 、 Recommend_lv 、 Lv_count。
- TEAM_BATTLE_AWARD.json：TEAM战斗的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 156 条记录；首记录字段：id 、 blood 、 star 、 reward 、 show_award。
- WORLD_LEVEL_CONF.json：副本或竞技玩法中的世界等级相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 title 、 pet_top_level 、 pet_level_limit 、 pet_team_quantity 、 pet_bag_space_quantity 、 pet_settled_basic_amplify 、 promote_desc。

### 物品、奖励与背包

说明：物品定义、背包归类、奖励包、掉落、邮件与各类可消耗资源配置。

- BAG_ITEM_CONF.json：物品与奖励系统中的背包物品相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5040 条记录；首记录字段：id 、 name 、 editor_name 、 description 、 icon 、 big_icon 、 type 、 lable_type。
- BAG_ITEM_SEQUENCE.json：物品与奖励系统中的背包物品序列相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 sequence_desc。
- BAG_ITEM_TYPE_CONF.json：背包物品类型的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 22 条记录；首记录字段：id 、 type 、 type_name 、 type_capacity_limit 、 sequence 、 type_hint_limit_max 、 type_number_warn 、 single_item_limit_max。
- BAG_PET_GIFT_EFFECT_CONF.json：背包宠物赠礼效果的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 41 条记录；首记录字段：id 、 editor_name 、 pet_like_elements 、 close_ask_amounts 、 close_exp_like 、 pet_action。
- BOTTLE_CONF.json：物品与奖励系统中的瓶子相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 battle_weather 、 probability 、 battle_increase。
- BOTTLE_TIMES_CONF.json：物品与奖励系统中的瓶子TIMES相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 lower_limit 、 upper_limit 、 exchange_conf。
- BOTTLE_VOLUME_CONF.json：瓶子VOLUME的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 lower_limit 、 upper_limit 、 exchange_conf。
- BREAK_ITEM_CONF.json：物品与奖励系统中的突破物品相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 95 条记录；首记录字段：id 、 unit_type 、 break_level 、 break_type_item 、 exchange_ratio 、 exchange_type_item。
- BREAK_NUMBER_CONF.json：物品与奖励系统中的突破数量相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 require_level 、 require_grow_time 、 type_item_number 、 dust_number 、 spec_item_number 、 currency_type 、 currency_number。
- BREAK_REWARD_CONF.json：突破的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 96 条记录；首记录字段：id 、 editor_name 、 break_award。
- CALLBACK_MAIL_CONF.json：回调邮件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 mail_id 、 callback_param_1。
- CRYSTAL_CONF.json：物品与奖励系统中的水晶相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 19 条记录；首记录字段：id 、 type。
- GOODS_RETURN_CONF.json：商品RETURN的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 156 条记录；首记录字段：id 、 gender 、 need_goods_type 、 need_goods_id 、 return_goods_type 、 return_goods_id 、 return_num。
- IMPORTANT_ITEM_CONF.json：物品与奖励系统中的重要物品相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 3535 条记录；首记录字段：id 、 sheet_name 、 sheet_id。
- IMPORTANT_OUTPUT_PATH_CONF.json：物品与奖励系统中的重要产出路径相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- IMPORTANT_PET_MUTATION_CONF.json：重要宠物变异的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 870 条记录；首记录字段：id 、 sheet_name 、 value。
- ITEM_LABLE_TYPE_CONF.json：物品LABLE类型的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 13 条记录；首记录字段：id 、 type_name 、 type_capacity_limit 、 sequence 、 type_number_limit 、 type_hint_limit_max。
- ITEM_TRANS_CONF.json：物品与奖励系统中的物品转换相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 editor_name 、 trans_id。
- ITEM_UNLOCK_MAP_CONF.json：物品解锁地图的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 exchange_id。
- LOTTERY_RESULT_PAGE_CONF.json：抽奖结果页的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 part_name 、 part_desc 、 umg_path。
- LOTTERY_REWARD_CONF.json：抽奖的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 lottery_name 、 appear_time 、 disappear_time 、 condition_group。
- MAIL_CONF.json：邮件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 101 条记录；首记录字段：id 、 mail_type 、 mail_platform 、 mail_condition 、 validity 、 mail_title 、 mail_sender 、 mail_content。
- OPERATION_MAIL.json：运营邮件的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- RANDOM_GOODS_CONF.json：随机商品的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 53 条记录；首记录字段：id 、 goods_name 、 package_id 、 enable 、 Type 、 item_id 、 item_num 、 price_goods_type。
- REPORT_COIN_RATIO_CONF.json：物品与奖励系统中的报告金币RATIO相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 21 条记录；首记录字段：id 、 enum_ReportCoinRatio 、 enum_param 、 enum_ratio 、 enum_name 、 param_name。
- RESOURCE_CONF.json：物品与奖励系统中的RESOURCE相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 name 、 magician_level 、 role_level 、 pet_promotion_level 、 mission_id 、 reward_id 、 NPC_VISIBLE。
- REWARD_CONF.json：奖励的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 7179 条记录；首记录字段：id 、 Name 、 Type 、 RewardItem。
- REWARD_TAG.json：奖励标签的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- REWARD_WEIGHT_CHANGE_CONF.json：奖励权重CHANGE的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 change_rule。
- TREASURE_ITEM_CONF.json：物品与奖励系统中的宝藏物品相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 10 条记录；首记录字段：id 、 choose_item_group。
- VISUAL_ITEM_CONF.json：物品与奖励系统中的VISUAL物品相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 50 条记录；首记录字段：id 、 sort_id 、 displayName 、 discription 、 bigIcon 、 iconPath 、 item_quality 、 type_desc。

### 商城、商店与兑换

说明：商城、商店、抽奖、兑换、返利与商品刷新规则配置。

- EXCHANGE_CONF.json：兑换的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 1166 条记录；首记录字段：id 、 editor_name 、 unlock_type 、 use_type 、 is_check_npc_near 、 exchange_time_lower_limit 、 exchange_time_upper_limit 、 get_item。
- EXCHANGE_GOODS_CONF.json：兑换商品的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id。
- EXCHANGE_NORMAL_FILTER_CONF.json：兑换普通FILTER的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 filter_type 、 filter_enum_name 、 filter_enum_value 、 filter_desc 、 filter_icon。
- EXCHANGE_TIME_LIMIT_CONF.json：兑换时间限制的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 17 条记录；首记录字段：id 、 exchange_periodic_limit 、 exchange_manufacture_times 、 refresh_reset_type 、 refresh_reset_param1 、 refresh_reset_param2 、 refresh_limit_text。
- MALL_CONF.json：商城的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 19 条记录；首记录字段：id 、 name 、 Enable 、 limit_type 、 replenish_cnt 、 EnableTime 、 DisableTime 、 GoodsType。
- MALL_FRAME_CONF.json：商城FRAME的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：shop_id 、 tab_id_1 、 tab_name_1 、 icon 、 mall_type 、 system_control_id。
- MALL_MONTHLY_PASS_REWARD.json：商城月卡的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 editor_name 、 reward_id 、 monthly_pass_reward_type。
- MALL_RAND_CONF.json：商城RAND的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 RandItem。
- MALL_STORE_CONF.json：商城商店的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 RandMallItem。
- NORMAL_SHOP_CONF.json：普通商店的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 887 条记录；首记录字段：id 、 shop_id 、 editor_name 、 goods_name 、 enable 、 shop_pos 、 Type 、 item_id。
- RANDOM_SHOP_CONF.json：随机商店的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 random_type 、 reset_type 、 reset_param1 、 reset_param2 、 random_goods_num 、 package。
- SHOP_CONF.json：商店的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 95 条记录；首记录字段：id 、 editor_name 、 shop_name 、 shop_icon 、 checkout_icon 、 is_enable 、 shop_type 、 goods。
- SHOP_TOTAL_CONSUMPTION_CONF.json：商店总消费的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 shop_id 、 editor_name 、 price_goods_type 、 price_goods_id 、 shop_consumption_reward。
- WISH_EXCHANGE_CONF.json：心愿兑换的商品、价格、奖池、刷新或兑换规则配置。 结构：RocoDataRows + LocalizationStrings；约 26 条记录；首记录字段：id 、 icon 、 star_light_upper_limit 、 exchange_need_star_light。

### 时装、家具、家园与生活玩法

说明：外观装扮、家具摆设、家园等级、种植、拍照与生活类玩法配置。

- BOND_TAB_CONF.json：羁绊TAB的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 fashion_bond_band 、 band_name 、 icon 、 band_long_text 、 band_short_text。
- BOND_TINT_CONF.json：羁绊TINT的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 name 、 fashion_bond_quality 、 tint_type。
- CHANGE_COLOUR_CONF.json：家园或生活玩法中的CHANGECOLOUR相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 icon 、 rank_value 、 ui_value。
- CLOSET_TAB_CONF.json：衣橱TAB的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 22 条记录；首记录字段：id 、 tabname 、 rank_value 、 use_FashionLabelType 、 use_SalonLabelType 、 icon 、 gray_icon 、 shop_icon。
- COLOR_RANDOM_CONF.json：颜色随机的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 39 条记录；首记录字段：id 、 name 、 mat_color_1 、 mat_color_2 、 ui_color_1 、 ui_color_2 、 shine_strength 、 prob。
- FASHION_BAGCHARM_CONF.json：时装BAGCHARM的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 30 条记录；首记录字段：id 、 editor_name 、 charm_kind 、 kind_name。
- FASHION_BOND_CONF.json：时装羁绊的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 name 、 fashion_bond_quality 、 suits_id 、 petbase_id 、 pet_interact_id 、 perform_id 、 fashion_bond_source。
- FASHION_DRESSFORM_CONF.json：时装换装形态的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- FASHION_ITEM_CONF.json：时装物品的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 703 条记录；首记录字段：id 、 name 、 editor_name 、 type_name 、 gender 、 suits_id 、 item_quality 、 fashion_tops_tag。
- FASHION_PACKAGE_CONF.json：时装套包的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 18 条记录；首记录字段：id 、 name 、 gender 、 bg_colour 、 bg_image。
- FASHION_PERFORM_CONF.json：时装表现的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 petbase3_id 、 suiteffect3_rest_name 、 suiteffect3_rest_skill 、 suiteffect3_callout_name 、 suiteffect3_callout_skill 、 suiteffect3_win_name 、 suiteffect3_win_skill。
- FASHION_SUITS_CONF.json：时装套装的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 102 条记录；首记录字段：id 、 name 、 editor_name 、 gender 、 item_id 、 effect_item_id 、 suits_icon 、 suits_icon_big。
- FASHION_TAB_CONF.json：时装TAB的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 16 条记录；首记录字段：id 、 use_FashionLabelType 、 icon 、 rank_value。
- FASHION_VI_CONF.json：时装视觉的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 editor_name 、 goods_type 、 goods_id。
- FASHION_WAND_CONF.json：时装魔杖的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 WandName 、 WandMesh。
- FRUIT_TREE_CONF.json：果树的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 53 条记录；首记录字段：id 、 area 、 book_id 、 reward_id。
- FRUIT_TREE_RULE_CONF.json：果树的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 range_max 、 range_min 、 dialogue_id 、 action_type。
- FURNITURE_CLASSIFICATION_CONF.json：家具CLASSIFICATION的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 25 条记录；首记录字段：id 、 tab_name 、 is_first_tab 、 sec_tab_array 、 visual_angle 、 tab_icon_build_1 、 tab_icon_build_2。
- FURNITURE_EFFECT_CONF.json：家具效果的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 trigger_type 、 effect_type 、 effect_type_param。
- FURNITURE_HANDBOOK_CONF.json：家具图鉴的图鉴条目、收集顺序或图鉴奖励配置。 结构：RocoDataRows + LocalizationStrings；约 170 条记录；首记录字段：id 、 furniture_id 、 reward_id 、 Funiture_ui_handbook_percentage 、 Funiture_ui_handbook_angle。
- FURNITURE_ITEM_CONF.json：家具物品的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 183 条记录；首记录字段：id 、 name 、 type 、 tab_type 、 model 、 icon 、 cell_length 、 cell_width。
- FURNITURE_VERSION_CONF.json：家具VERSION的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 furniture_item_id 、 furniture_version 、 version_weight。
- GLASS_TYPE_CONF.json：GLASS类型的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 glass_type 、 weight 、 star_ratio。
- HIDDEN_GLASS_CONF.json：隐藏GLASS的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 name 、 type 、 active_season 、 weight 、 season_pet 、 main_tex 、 glass_color_1。
- HOME_COMFORT_CONF.json：家园舒适度的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 coordinate 、 furniture_coin_ratio 、 home_exp_ratio。
- HOME_FILTER_CONF.json：家园FILTER的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 57 条记录；首记录字段：id 、 filter_type 、 filter_enum_name 、 filter_enum_value 、 filter_desc 、 filter_icon。
- HOME_GLOBAL_CONFIG.json：家园系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 115 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- HOME_LEVEL_CONF.json：家园LEVEL的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 25 条记录；首记录字段：id 、 farmplan_num。
- HOME_PET_FEED_CONF.json：家园宠物喂养的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 option_num 、 need_time 、 furniture_coin_num 、 home_exp_num 、 food_close_exp 、 superise_reward。
- HOME_PET_LAY_EGG_RATE_CONF.json：家园宠物产出蛋概率的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 65 条记录；首记录字段：id 、 nest_num。
- INTERIOR_FINISH_CONF.json：室内完成的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 12 条记录；首记录字段：id 、 name 、 type 、 comfort 、 classification 、 icon。
- PLANT_GROW_CONF.json：PLANTGROW的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 24 条记录；首记录字段：id 、 plant_tab 、 plant_harvest 、 home_lv 、 plant_grow_grade。
- PLANT_GROW_STAGE_CONF.json：PLANTGROW阶段的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 PlantStage。
- PLANT_LAND_COORDINATE_CONF.json：PLANTLANDCOORDINATE的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 coordinate。
- PLANT_TAB_CONF.json：PLANTTAB的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 name。
- ROOM_CONF.json：ROOM的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 name 、 expend_vitem_type 、 look。
- SALON_ITEM_CONF.json：沙龙物品的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 207 条记录；首记录字段：id 、 name 、 editor_name 、 gender 、 type 、 icon 、 avatar_id 、 colour_id。
- SALON_TAB_CONF.json：沙龙TAB的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 icon。
- SLIDE_CONF.json：家园或生活玩法中的SLIDE相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 23 条记录；首记录字段：id 、 picture 、 text 、 mask_effect_type 、 picture_switch_type 、 auto_play_time 、 background_music 、 next_picture。
- TAKE_PHOTO_EMOJI_CONF.json：拍照EMOJI的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 14 条记录；首记录字段：id 、 name 、 male_emoji_path 、 female_emoji_path 、 icon。
- TAKE_PHOTO_FILTER_CONF.json：拍照FILTER的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 name 、 icon。
- TAKE_PHOTO_POSE_CONF.json：拍照POSE的装扮、家园、家具、种植或生活玩法配置。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 name 、 icon 、 look_at。
- TAKEPHOTO_GLOBAL_CONFIG.json：TAKEPHOTO系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 49 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- WATER_MARK_CONTROL_CONF.json：水印标记控制的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 world_id 、 namespace 、 close_watermark。
- WATER_MARK_WHITE_LIST_CONF.json：水印标记白名单的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 1572 条记录；首记录字段：id 、 openid 、 world_id 、 namespace 、 end_time 、 account_type 、 account 、 operator。

### 角色、成长与数值

说明：角色成长、经验曲线、等级段、品质档位、上限值与成长修正配置。

- BASIC_QUALITY_CONFIG_CONF.json：基础品质的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 354 条记录；首记录字段：id 、 name 、 group 、 cvar 、 valueType 、 Qualities_PC 、 Qualities_IOS 、 Qualities_Android。
- COLLEGE_SELECTION_CONF.json：学院SELECTION的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 name 、 pic 、 selected_pic 、 text 、 select_to_dialo 、 editor_name。
- EVOLUTION_ACTION_DATA.json：进化动作的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 action_lower_limit 、 action_upper_limit。
- EVOLUTION_LEVEL_DATA.json：进化LEVEL的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 13 条记录；首记录字段：id 、 chance。
- GROW_LEVEL_CONF.json：角色成长系统中的GROWLEVEL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 50 条记录；首记录字段：id 、 require_pet_level 、 require_item 、 attr。
- HINT_LEVEL.json：角色成长系统中的HINTLEVEL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 min 、 max。
- INSPIRE_LEVEL_CONF.json：角色成长系统中的激励LEVEL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 require_item 、 type_enhance_add 、 type_enhance_data 、 attr。
- LEVEL_GET_FIX_CONF.json：角色成长系统中的LEVEL获取修正相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 201 条记录；首记录字段：id 、 level_diff 、 level_grade_fix。
- OVERLEVEL_RATIO_EXP.json：角色成长系统中的超等级RATIOEXP相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 50 条记录；首记录字段：id 、 ratio_gain_exp。
- OVERRIDE_QUALITY_CONF.json：OVERRIDE品质的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 overrideId 、 name 、 valueType 、 cvar 、 value。
- QUALITY_DEFAULT_CONF.json：品质默认的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 16 条记录；首记录字段：id 、 name 、 valueType 、 Qualities。
- QUALITY_GROUP_SETTING_CONF.json：品质组SETTING的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 name 、 Qualities。
- QUALITY_LOCALIZATION_CONF.json：品质本地化的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id。
- QUALITY_MAPPING_CONF.json：画质映射的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 17 条记录；首记录字段：id 、 name 、 valueType 、 Qualities。
- ROLE_EXP_CONF.json：角色成长系统中的ROLEEXP相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 70 条记录；首记录字段：id 、 need_exp。
- ROLE_GLOBAL_CONFIG.json：ROLE系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 152 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- ROLE_STAR_NPCLEVEL_CHANGE_CONF.json：ROLESTARNPCLEVELCHANGE的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 3116 条记录；首记录字段：id 、 editor_name 、 index_param 、 level 、 down_wave。
- ROLE_WORLD_LEVEL_MAP_CONF.json：ROLE世界等级地图的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 74 条记录；首记录字段：id 、 list_type 、 grade_num。
- TEXT_EXP_CONF.json：角色成长系统中的TEXTEXP相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 exp_icon 、 exp_localization_id。
- UPGRADE_CONF.json：角色成长系统中的UPGRADE相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 50 条记录；首记录字段：id 、 topic 、 text 、 buff。
- VITALITY_CONF.json：角色成长系统中的活力相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 max_vitality 、 vitality_recover_delay 、 vitality_recover 、 vitality_recover_percent 、 vitality_recover_idle 、 vitality_recover_percent_idle 、 forbid_status。

### 图鉴、收集与称号

说明：图鉴、手册、称号、勋章、收藏奖励与展示页签配置。

- CARD_ICON_CONF.json：卡片图标的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 580 条记录；首记录字段：id 、 icon_resource_path 、 icon_resource_name 、 is_initial_unlock 、 unlock_condition 、 item_description 、 bottom_description 、 card_quality。
- CARD_LABEL_CONF.json：卡片标签的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 350 条记录；首记录字段：id 、 label_type 、 label_text 、 is_initial_unlock 、 label_name 、 item_description 、 bottom_description 、 card_quality。
- CARD_MODULE_CONF.json：卡片MODULE的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 module_type 、 module_name 、 module_num。
- CARD_SKIN_CONF.json：卡片皮肤的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 60 条记录；首记录字段：id 、 skin_resource_path 、 skin_resource_name 、 is_initial_unlock 、 item_description 、 bottom_description 、 card_quality 、 skin_get_ways。
- HANDBOOK_FILTER_CONF.json：图鉴FILTER的图鉴条目、收集顺序或图鉴奖励配置。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：id 、 filter_type 、 filter_enum_name 、 filter_enum_value 、 filter_desc 、 filter_icon。
- MEDAL_BOND_CONF.json：勋章羁绊的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 medal_id 、 petbase_id 、 is_species_range。
- MEDAL_CONF.json：勋章的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 49 条记录；首记录字段：id 、 name 、 quality 、 icon 、 big_icon 、 desc 、 medal_type 、 medal_source。
- MEDAL_TASK_CONF.json：勋章TASK的任务条件、流程步骤或任务关联配置。 结构：RocoDataRows + LocalizationStrings；约 29 条记录；首记录字段：id 、 desc 、 get_condition 、 condition_data1 、 condition_data2 、 count。
- TITLE_CONF.json：称号的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 78 条记录；首记录字段：id 、 title 、 head_icon 、 subtitle。
- WAREHOUSE_COLLECT_MARK.json：WAREHOUSECOLLECT标记的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 mark_name 、 default_diplay_mark 、 locked_mark_icon 、 mark_icon 、 mark_flat_icon 、 mark_small_flat_icon 、 mark_desc_text。

### 社交、分享与回归

说明：好友、分享、回流召回、联机展示与社交奖励配置。

- FRIEND_GLOBAL_CONFIG.json：好友系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 33 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- HIDE_PLAYER_MANUAL_OPTION_CONF.json：社交系统中的隐藏玩家手册选项相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 17 条记录；首记录字段：id 、 type 、 allowed_list。
- PLATFORM_PRIVILEGES.json：平台特权的好友、分享、回流或社交奖励配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 system_control_rule_id 、 button_name 、 icon 、 rank_id 、 ui 、 screen_type。
- QQ_ARK_SHARE_CONF.json：QQ方舟分享的好友、分享、回流或社交奖励配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 qq_ark_business_type 、 qq_ark_share_type 、 interfaceid 、 type 、 scene_id。
- REACALL_CONF.json：回流的好友、分享、回流或社交奖励配置。 结构：RocoDataRows + LocalizationStrings；约 25 条记录；首记录字段：id 、 reacall_title_name 、 jump_target 、 data1。
- REACALL_LIST_CONF.json：回流的好友、分享、回流或社交奖励配置。 结构：RocoDataRows + LocalizationStrings；约 25 条记录；首记录字段：id 、 reacall_list_name 、 reacall_list_picture 、 main_terms_id1 、 main_terms_id2 、 main_terms_id3 、 sub_terms_id1 、 sub_terms_id2。
- REACALL_TREMS_CONF.json：回流条款的好友、分享、回流或社交奖励配置。 结构：RocoDataRows + LocalizationStrings；约 35 条记录；首记录字段：id 、 reacall_terms_name 、 reacall_terms_picture 、 reacall_terms_text 、 reacall_terms_teach 、 reacallt_terms_unlock_trigger1 、 trigger1_data。
- SHARE_BASE_CONF.json：分享基础的好友、分享、回流或社交奖励配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 share_button_type 、 share_name 、 base_id 、 is_open 、 system_control_limit 、 channel_limit。
- SHARE_CONF.json：分享的好友、分享、回流或社交奖励配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 name 、 login_required 、 login_plat 、 share_type 、 system_control_limit 、 qrcode_scenario 、 qrcode_link。
- SHARE_PART_CONF.json：分享部分的好友、分享、回流或社交奖励配置。 结构：RocoDataRows + LocalizationStrings；约 13 条记录；首记录字段：id 、 share_button_type 、 share_part_name 、 tab_name 、 share_type 、 umg_path。
- SHARE_REWARD_CONF.json：分享的奖励内容、奖励档位或发放条件配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 share_reward_get_times 、 reward_refresh_rules 、 goods_type 、 goods_id 、 goods_count。

### UI、引导与客户端表现

说明：界面布局、引导流程、按钮配置、红点、提示、镜头与展示控制配置。

- BUTTON_SETTING_CONF.json：按钮SETTING的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 61 条记录；首记录字段：id 、 button_action_name 、 numList。
- CAMERA_CONF.json：镜头的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 editor_name 、 interact_camera_type 、 interact_camera_param1 、 skill_camera_path。
- CAMERA_MOVE_LITE.json：镜头MOVELITE的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 101 条记录；首记录字段：id 、 guide_tips 、 move_type 、 move_path 、 focus_npc 、 camera_launch_time 、 focus_time 、 camera_back_time。
- CAMERA_PATH.json：镜头路径的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 64 条记录；首记录字段：id 、 tips 、 position 、 spline_point。
- CURVE_DETAIL_INFO.json：曲线DETAIL的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 60 条记录；首记录字段：id 、 curve_id 、 curve_path 、 total_length 、 vector。
- CUSTOMCAMERA_CONF.json：自定义镜头的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 POS_OFFSET_X 、 POS_OFFSET_Y 、 POS_OFFSET_Z 、 ROT_OFFSET_Y 、 ROT_OFFSET_Z 、 DIST。
- DEFAULT_BUTTON_CONF.json：默认按钮的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 197 条记录；首记录字段：id 、 button_action 、 default_button。
- GUIDE_ANIMATION_IGNORE_CONF.json：引导ANIMATIONIGNORE的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 editor_name 、 panel_name 、 anim_names。
- GUIDE_BANNER_CONF.json：引导横幅的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 pc_text 、 mobile_text 、 editor_name。
- GUIDE_BUTTON_CONF.json：引导按钮的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 65 条记录；首记录字段：id 、 editor_name 、 ui_path 、 ui_button_name 、 watch_ia_names。
- GUIDE_CONF.json：引导的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 auto_create 、 trigger_range 、 side_trigger_range 、 move_speed 、 max_lifetime 、 speed_gradient_ratio 、 mid_point_index。
- GUIDE_CTRL_CONF.json：引导CTRL的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 204 条记录；首记录字段：id 、 editor_name 、 guide_group_id 、 sub_guide_id 、 pc_show 、 mobile_show 、 guide_group_priority 、 can_interrupt_other。
- GUIDE_DRAG_CONF.json：引导拖拽的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 editor_name 、 simulate_drag 、 start_type 、 start_ui_path 、 end_type 、 end_ui_path。
- GUIDE_FOCUS_CONF.json：引导焦点的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 117 条记录；首记录字段：id 、 ui_path 、 ui_button_name 、 circle_data 、 focus_type 、 text_pos 、 pc_text 、 pc_edior_pos。
- GUIDE_IA_CONF.json：引导IA的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 editor_name 、 ia_name 、 ia_command。
- GUIDE_PANEL_CONF.json：引导面板的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 29 条记录；首记录字段：id 、 editor_name 、 panel_name。
- IOS_RATING_POPUP_CONF.json：客户端表现系统中的iOS评分弹窗相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 type 、 data1 、 is_open 、 limit_times 、 ios_rating。
- LOADING_TIPS_CONF.json：加载提示的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 64 条记录；首记录字段：id 、 loading_tips_title 、 loading_tips_text。
- MARK_FAKE_MAGIC_MESSAGE_CONF.json：标记伪魔法消息的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 player_name 、 player_icon 、 message_content 、 like_count 、 hug_count 、 light_count 、 area_id。
- MARK_GAMEPLAY_CONF.json：标记GAMEPLAY的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 gameplay_type 、 priority 、 push_amount 、 push_grid_amount_max 、 push_grid_amount_min 、 create_grid_amount_max 、 create_amount_per_day_max。
- MARK_MESSAGE_LIFE_TIME_CONF.json：标记消息生命周期时间的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 attitude_count 、 magic_message_add_time。
- MARK_VIDEO_PROTOCOL.json：标记视频PROTOCOL的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 37 条记录；首记录字段：id 、 protocol_id 、 protocol_string 、 mask_type 、 tips。
- MESSAGE_CONF.json：消息的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 58 条记录；首记录字段：id 、 myname 、 text 、 receive_des。
- NOTICE_CONF.json：公告的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：notice_id 、 start_time 、 end_time 、 notice_title 、 notice_banner 、 notice_content。
- PC_LEVEL_CPU_AMD_CONF.json：客户端表现系统中的PCLEVELCPUAMD相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 453 条记录；首记录字段：id 、 name 、 score。
- PC_LEVEL_CPU_INTEL_CONF.json：客户端表现系统中的PCLEVELCPUINTEL相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1009 条记录；首记录字段：id 、 name 、 score。
- PC_LEVEL_GPU_AMD_CONF.json：客户端表现系统中的PCLEVELGPUAMD相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 100 条记录；首记录字段：id 、 name 、 score。
- PC_LEVEL_GPU_NVIDIA_CONF.json：客户端表现系统中的PCLEVELGPUNVIDIA相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 164 条记录；首记录字段：id 、 name 、 score。
- RED_POINT_CONF.json：红点的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 270 条记录；首记录字段：id 、 child_id。
- SECONDARY_TAB_CONF.json：客户端表现系统中的次级TAB相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 name 、 activity_type 、 base_id。
- SELECT_CONF.json：选择的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 9187 条记录；首记录字段：id 、 online_process 、 text 、 opt_dia_relate 、 select_icon 、 times 、 obtain_story_flags 、 select_next_dialogue。
- TRACK_NUMBER.json：客户端表现系统中的追踪数量相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 10 条记录；首记录字段：id 、 meaning 、 number。
- UI_BAN_CONF.json：界面禁用的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：ui_ban_id 、 function_ban_id 、 ui_ban_icon。
- UI_COMPASS.json：界面COMPASS的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- UI_CONF.json：界面的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 id_num 、 umg_path 、 module 、 layer。
- UI_ENTER_BAN_CONF.json：界面进入禁用的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 38 条记录；首记录字段：id 、 editor_name 、 function_entrance 、 function_Ban_Type 、 is_hide_entrance 、 change_reason 、 unlock_cond_list 、 auto_perform。
- UI_KEYNAME_CONVERT.json：界面KEYNAMECONVERT的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 114 条记录；首记录字段：id 、 UE_button_name 、 UI_button_name。
- UI_LOBBY_MAIN_COMPASS.json：界面LOBBYMAINCOMPASS的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 19 条记录；首记录字段：id 、 icon_path 、 icon_name 、 icon_name_roco 、 chinese_pinyin。
- UI_RECONNECT.json：界面RECONNECT的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 editor_name 、 panel_name。

### 音频、动画、模型与特效

说明：音效、音乐、动画、模型、骨骼、镜头路径、材质与资源挂点配置。

- ACTION_ANIM_BONE_TRANSFORM_INFO.json：动作骨骼变换的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 3013 条记录；首记录字段：id 、 refresh_id 、 model_id 、 anim_name 、 bone_name 、 frame 、 location 、 rotation。
- ACTION_RESULT_TYPE_CONF.json：动作结果类型的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 16 条记录；首记录字段：id 、 editor_name 、 expand_dialogs。
- ANIM_CONF.json：动画的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 1945 条记录；首记录字段：id 、 anim_info。
- ANIM_ID_CONF.json：动画ID的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 542 条记录；首记录字段：id 、 anim_name。
- ANIM_MOTION_CURVE_CONF.json：动画运动曲线的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 1945 条记录；首记录字段：id 、 walk_curve 、 run_curve。
- AUDIO_CAVE_CONF.json：音频洞穴的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 cave_name 、 state_name 、 sound_id。
- AUDIO_FUBEN_CONF.json：音频副本的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 76 条记录；首记录字段：id 、 editor_name 、 scene_name 、 scene_state_name。
- AUDIO_LENGTH_CONF.json：音频长度的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 34245 条记录；首记录字段：id 、 max_time。
- AUDIO_MODEL_CONF.json：音频模型的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 name 、 model_list。
- AUDIO_NATURE_CONF.json：音频环境的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 name 、 cool_down_min 、 cool_down_max 、 cool_down_min_Others 、 cool_down_max_Others 、 cool_down_min_Wild 、 cool_down_max_Wild。
- EFFECT_ANIMATION.json：效果ANIMATION的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id。
- EFFECT_CONF.json：效果的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 956 条记录；首记录字段：id 、 editor_name 、 effect_order 、 type 、 effect_param。
- LOC_FILE.json：资源表现系统中的定位文件相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- MODEL_COLLISION_CONF.json：模型碰撞的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 1946 条记录；首记录字段：id 、 collision_info。
- MODEL_CONF.json：模型的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 2819 条记录；首记录字段：id 、 editor_name 、 path 、 capsule_radius 、 capsule_halfheight 、 SMR 、 model_scale 、 capsule_as_root。
- MODEL_MAT_CONF.json：模型材质的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 239 条记录；首记录字段：id。
- MODEL_SOCKET_CONF.json：模型挂点的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 socket_info。
- MOVIE_CONF.json：过场的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 41 条记录；首记录字段：id 、 editor_name 、 movie_path 、 sound_id 、 begin_black 、 end_black 、 restart_bgm 、 mute_time。
- MUSIC_APPLY_LIST_CONF.json：音乐APPLY的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 15 条记录；首记录字段：id 、 list_name 、 list_sort 、 list_icon_path 、 list_type 、 interface_type。
- MUSIC_CONF.json：音乐的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 149 条记录；首记录字段：id 、 music_name 、 music_type 、 music_img_path 、 EventName 、 mark_event_name 、 StateGroup_State 、 apply_list。
- MUSIC_FREEMIUM_CONF.json：音乐免费层的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 10 条记录；首记录字段：id 、 music_id 、 start_time 、 end_time。
- MUSIC_TYPE_CONF.json：音乐类型的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 music_type 、 music_type_name 、 icon_path。
- PARTICLE_RANDOM_CONF.json：粒子随机的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 sort_id 、 name 、 particle_res 、 headicon_particle_res 、 particle_icon 、 particle_small_icon 、 particle_big_icon。
- RELATIONTREE_ANIM_CONF.json：关系树动画的音频、动画、模型、特效或资源挂接配置。 结构：RocoDataRows + LocalizationStrings；约 22 条记录；首记录字段：id 、 interact_type 、 invite_key 、 accept_key。
- RELATIONTREE_BASIC_CONF.json：资源表现系统中的关系树基础相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 name 、 RelationTreeBasic 、 friend_need。
- RELATIONTREE_CONF.json：资源表现系统中的关系树相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 11 条记录；首记录字段：id 、 node_floor 、 node_type 、 name 、 RelationTreeTypeDefault 、 anim_key2。
- SUBTITLE_CONF.json：SUBTITLE的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 107 条记录；首记录字段：id 、 msg。
- VIDEO_SUBTITLES_CONF.json：视频字幕的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 82 条记录；首记录字段：id 、 track_id 、 begin_time 、 end_time 、 content。

### 系统、平台与调试

说明：全局参数、系统开关、平台兼容、性能分级、反作弊与 GM 调试配置。

- ACTCONTROLCONFIG.json：ACTCONTROLCONFIG的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 20 条记录；首记录字段：id 、 editor_name 、 is_open 、 login_plat_limit 、 version_rule 、 channel。
- ANTI_CHEAT_GLOBAL_CONFIG.json：反作弊系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 29 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- BAN_ACTION_CONF.json：禁用动作的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 9 条记录；首记录字段：id 、 type 、 allow_list。
- BP_GLOBAL_CONFIG.json：BP系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 key 、 editor_name 、 str。
- CHANNELCONTROLCONFIG.json：CHANNELCONTROLCONFIG的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 8 条记录；首记录字段：id 、 cli_login_channel 、 editor_name。
- CHINA_BENCHMARK_DEVICE_CONF.json：中国基准设备的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 2731 条记录；首记录字段：id 、 score 、 benchmarkLevel 、 deviceName 、 cpuModel 、 gpuModel 、 deviceModel。
- CLIENT_PUBLIC_CMD.json：客户端公共命令的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 86 条记录；首记录字段：id 、 text。
- FUNCTION_BAN_CONF.json：功能封禁的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 65 条记录；首记录字段：id 、 editor_name 、 ban_desc 、 desc_priority 、 function_ban_list。
- FUNCTION_BAN_SCENE_RES_CONF.json：功能封禁场景资源的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- FUNCTION_BAN_SPECIAL_NPC_CONF.json：功能封禁特殊NPC的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id。
- GLOBAL_CONFIG.json：全局配置系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 479 条记录；首记录字段：id 、 key 、 editor_name。
- GM_BUTTON_CONF.json：GM按钮的界面展示、引导流程或客户端表现配置。 结构：RocoDataRows + LocalizationStrings；约 31 条记录；首记录字段：id 、 editor_name 、 button_string 、 task_id 、 position 、 unlock_camp 、 reward_id 、 world_level。
- GM_COMMAND_CONF.json：GMCOMMAND的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 1508 条记录；首记录字段：id 、 gm_group 、 gm_command。
- GM_GROUP_CONF.json：GM组的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 1379 条记录；首记录字段：id 、 tab_id 、 button_name 、 gm_group。
- GM_MAINTAB_CONF.json：GM主页签的 NPC 行为、AI 逻辑或交互流程配置。 结构：RocoDataRows + LocalizationStrings；约 49 条记录；首记录字段：id 、 maintab_name 、 lua_filename。
- GM_SERVER_CMD_CONF.json：GM服务端命令的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 89 条记录；首记录字段：id 、 cmd_id 、 cmd_name 、 cmd_desc。
- GM_SUBTAB_CONF.json：GMSUBTAB的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 85 条记录；首记录字段：id 、 subtab_name 、 maintab_id 、 lua_filename。
- LOCALIZATION_CONF.json：本地化的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 4943 条记录；首记录字段：id 、 msg 、 editor_name。
- ONLINE_GLOBAL_CONFIG.json：在线系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 44 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- PAYMENT_GLOBAL_CONFIG.json：支付系统的全局参数、默认值与开关配置。 结构：RocoDataRows + LocalizationStrings；约 7 条记录；首记录字段：id 、 key 、 editor_name 、 num。
- PROTO_CMD_SEQ_CONF.json：协议命令顺序的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 61 条记录；首记录字段：id 、 prompt_text。
- RESOLUTION_CONF.json：分辨率的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 28 条记录；首记录字段：id 、 resolution_length 、 resolution_width。
- RPC_LOSS_RATE_CONF.json：RPC丢包概率的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 4 条记录；首记录字段：id 、 svc_name 、 meth_name。
- SECOND_TIER_PASSWORD_CONF.json：系统层中的二级密码相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 goods_type 、 goods_id。
- SYSTEM_RED_POINT_BAN_CONF.json：SYSTEM红点禁用的场景、区域、坐标、传送或世界展示配置。 结构：RocoDataRows + LocalizationStrings；约 29 条记录；首记录字段：id 、 editor_name 、 redpoint_id。
- SYSTEMCONTROLCONFIG.json：SYSTEMCONTROLCONFIG的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；约 215 条记录；首记录字段：id 、 editor_name 、 is_open 、 is_audit 、 login_plat_limit 、 version_rule 、 channel。
- TEST_RECHARGE_AMOUNT_CONF.json：测试充值额度的系统参数、平台限制、性能分级或调试配置。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- WORLD_BENCHMARK_DEVICE_CONF.json：WORLD基准设备的收藏展示、称号、勋章或收集系统配置。 结构：RocoDataRows + LocalizationStrings；约 1442 条记录；首记录字段：id 、 rank 、 score 、 deviceName 、 deviceModel 、 cpuModel 、 gpuModel。

### 未归类

说明：暂未归入固定主题。

- CAMP_CONF.json：该表用于定义营地相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 87 条记录；首记录字段：id 、 editor_name 、 camp_name 、 name 、 advantage_type 、 broadcast_name_func_id。
- CAMP_LEVELUP_CONF.json：该表用于定义营地升级相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 195 条记录；首记录字段：id 、 content_id 、 editor_name 、 level 、 travel_time 、 lay_chance 、 reward_item 、 regional_division。
- CAMP_PET_REPORT_CONF.json：营地宠物报告的宠物、孵化、骑乘、魔法或相关玩法配置。 结构：RocoDataRows + LocalizationStrings；约 142 条记录；首记录字段：id 、 report_story 、 report_target 、 type 、 condition 、 num 、 reward_id 、 dialogue。
- CHAT_EMOJI_CONF.json：该表用于定义CHATEMOJI相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 16 条记录；首记录字段：id 、 emoji_resource_name 、 is_initial_unlock 、 type_desc 、 bottom_description 、 card_quality 、 emoji_use_icon 、 emoji_esc。
- ESCAPE_INFO_CONF.json：该表用于定义逃跑相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- EVENT_BASE_CONF.json：该表用于定义事件基础相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 64 条记录；首记录字段：id 、 name 、 event_combine 、 level_reward_value 、 coin_reward_value 、 upgrade_reward 、 upgrade_show 、 upgrade_select。
- EVENT_COMBINE_CONF.json：该表用于定义事件组合相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 6 条记录；首记录字段：id 、 type 、 num1 、 num2 、 level_reward_value 、 upgrade_reward 、 upgrade_show 、 upgrade_select。
- FIX_DATA_EVOLUTION_ERROR.json：修正进化ERROR的对白文本、字幕、段落或文本表现配置。 结构：RocoDataRows + LocalizationStrings；约 275 条记录；首记录字段：id 、 vroleid 、 petbaseid 、 petgid 、 height 、 weight 、 pettalentskill 、 dtEventTime。
- GUARD_CONF.json：该表用于定义守护相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 5 条记录；首记录字段：id 、 is_open 、 Type 、 item_id 、 item_name 、 daily_max_times 、 daily_max_counts 、 reason_white_list。
- MINIGAME_CONF.json：该表用于定义小游戏相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 81 条记录；首记录字段：id 、 editor_name 、 effect_type 、 rule 、 time_limit 、 start_point 、 block_id 、 gameplay_area。
- MINIGAME_RULE_CONF.json：该表用于定义小游戏相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 81 条记录；首记录字段：id 、 group_id 、 contents。
- OWL_SANCTUARY_CONF.json：该表用于定义猫头鹰圣所相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 43 条记录；首记录字段：id 、 owl_sanctuary_type 、 init_level 、 level_max 、 slot_num 、 owl_npc_pet_habitat_group_id 、 mix_blood 、 cost_item_id。
- PRIVILEGE_WAND_CONF.json：该表用于定义PRIVILEGE魔杖相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 1 条记录；首记录字段：id 、 fashion_item_id 、 magic_transform_id。
- REFRESH_COND_CONF.json：该表用于定义刷新COND相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 3 条记录；首记录字段：id 、 npcs 、 altitude_min 、 altitude_max 、 depth_min 、 depth_max 、 tiles 、 tags。
- RES_BGS_TIME_CONF.json：该表用于定义资源背景音时间相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 30 条记录；首记录字段：id 、 bgs 、 buff_time。
- RES_BUFF_TIME_CONF.json：资源Buff时间的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 235 条记录；首记录字段：id 、 skill_time 、 skill_pre_end 、 skill_counter 、 skill_interrupt 、 skill_melee_before 、 skill_melee_after 、 skill_ranged_before。
- RES_SKILL_TIME_CONF.json：资源技能时序的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 1377 条记录；首记录字段：id 、 skill_time 、 skill_pre_end 、 skill_counter 、 skill_interrupt 、 skill_melee_after 、 skill_ranged_after。
- SPE_REFRESH_TRIG_CONF.json：该表用于定义SPE刷新触发相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；当前为空表；首记录字段：无可用样本字段。
- TRAVEL_FILTER_CONF.json：该表用于定义旅行FILTER相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 41 条记录；首记录字段：id 、 filter_type 、 filter_enum_name 、 filter_enum_value 、 filter_desc 、 filter_icon。
- TRAVEL_SEQUENCE_CONF.json：该表用于定义旅行序列相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 sequence_default 、 sequence_switch 、 sequence_desc。
- UNIT_CONF.json：该表用于定义单位相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 38 条记录；首记录字段：id 、 title。
- WEIGHT_GROUP_CONF.json：该表用于定义权重组相关字段、规则或资源关联。 结构：RocoDataRows + LocalizationStrings；约 2 条记录；首记录字段：id 、 group_weight。
- WORLD_BUFF_CONF.json：WORLDBuff的战斗规则、技能效果、属性克制或数值判定配置。 结构：RocoDataRows + LocalizationStrings；约 102 条记录；首记录字段：id 、 buff_name 、 editor_name 、 buff_type 、 tick_duration 、 buff_effect_type 、 params 、 option。