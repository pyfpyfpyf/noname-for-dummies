import { lib, game, ui, get, ai, _status } from "../../noname.js";
game.import("extension",function(){
	return {name:"金庸",content:function(config,pack){
    
},precontent:function(){
    
},help:{},config:{},package:{
    character:{
        character:{
            "三体":["male","qun",4,["智子"],[]],
            "李严":["male","qun",4,["运粮"],[]],
            "时迁":["male","qun",4,["探囊"],[]],
            "武松":["male","qun",4,["誓仇"],[]],
            "鲁智深":["male","qun",4,["扶弱"],[]],
            "张清":["male","qun",4,["飞石"],[]],
        },
        translate:{
            "三体":"三体",
            "李严":"李严",
            "时迁":"时迁",
            "武松":"武松",
            "鲁智深":"鲁智深",
            "张清":"张清",
        },
    },
    card:{
        card:{
        },
        translate:{
        },
        list:[],
    },
    skill:{
        skill:{
            "智子":{
                audio:"ext:金庸:2",
                trigger:{
                    player:"phaseUseBegin",
                },
                preHidden:true,
                content:function() {
                    'step 0'
                    player.chooseTarget('请选择一名角色', function(card, player, target) {
                        return target != player; // 不能选择自己
                    }).set('ai', function(target) {
                        return -get.attitude(player, target);
                    });
                    'step 1'
                    if (result.bool) {
                        var target = result.targets[0];
                        var cards = target.getCards("h"); // 获取目标的手牌
                        if (cards.length > 0) {
                            player.addShownCards(cards, "visible_zhaoran"); // 显示目标的手牌
                            game.log(player, '可以看到', target, '手牌');
                        }
                        target.markSkill('智子'); // 标记技能
                    }
                },
                mark:true,
                intro:{
                    content:function(storage, player) {
                        if (storage && storage.visibleCards && storage.visibleCards.length > 0) {
                            return '该角色的手牌对你可见';
                        }
                        return '未指定角色';
                    },
                },
                "_priority":0,
            },
            "昭然":{
                audio:"ext:金庸:2",
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                content:function(){
                    'step 0'
                    // 选择一名角色
                    player.chooseTarget('请选择一名角色', function(card, player, target){
                        return target != player; // 不能选择自己
                    }).set('ai', function(target){
                        return -get.attitude(player, target); // 选择态度最差的角色
                    });
                    'step 1'
                    if(result.bool){
                        var target=result.targets[0];
                        // 将目的手牌对所有其他角色可见
                        target.storage.visibleCards = target.getCards('h'); // 记录手牌
                        target.markSkill('昭然'); // 标记技能
                        game.log(target, '的手牌对所有角色可见');
                    }
                },
                mark:true,
                intro:{
                    content:function(storage, player){
                        if(storage && storage.visibleCards && storage.visibleCards.length > 0){
                            return '该角色的手牌对所有角色可见';
                        }
                        return '未指定角色';
                    },
                },
                "_priority":0,
            },
            "运粮":{
                audio:"ext:金庸:2",
                trigger:{
                    player:"phaseDrawBegin",
                },
                forced:true,
                content:function() {
                    'step 0'
                    player.chooseControl('少摸一张牌', '放弃摸牌', '不发动技能').set('prompt', '选择一项执行：');
                    'step 1'
                    if (result.control == '少摸一张牌') {
                        player.draw(); // 少摸一张牌
                        player.chooseTarget('请选择一名角色', function(card, player, target) {
                            return true; // 允许选择自己
                        }).set('ai', function(target) {
                            return -get.attitude(player, target);
                        });
                    } else if (result.control == '放弃摸牌') {
                        player.skip('draw'); // 放弃摸牌
                        player.chooseTarget('请选择一名角色', function(card, player, target) {
                            return true; // 允许选择自己
                        }).set('ai', function(target) {
                            return -get.attitude(player, target);
                        });
                    } else {
                        // 不发动技能，结束步骤
                        return;
                    }
                    'step 2'
                    if (result.bool) {
                        var target = result.targets[0];
                        if (result.control == '少摸一张牌') {
                            target.gain(target.hp, 'gain'); // 将手牌补至当前体力值
                            game.log(target, '的手牌补至当前体力值');
                        } else {
                            // 将手牌补至体力上限
                            var cardsToGain = target.maxHp - target.countCards('h'); // 计算需要补充的手牌数量
                            if (cardsToGain > 0) {
                                target.gain(cardsToGain, 'gain'); // 补充手牌
                                game.log(target, '的手牌补至体力上限');
                            } else {
                                game.log(target, '的手牌已满，无需补充');
                            }
                        }
                    }
                },
                mark:true,
                intro:{
                    content:function(storage, player) {
                        return '运粮：选择一项执行';
                    },
                },
                "_priority":0,
            },
            "探囊":{
                audio:"ext:金庸:2",
                enable:"phaseUse",
                usable:1,
                filter:function(event,player){
                    return game.hasPlayer(function(current){
                        return current!=player && current.countCards('h')>0;
                    });
                },
                filterTarget:function(card,player,target){
                    return player!=target && target.countCards('h')>0;
                },
                content:function(){
                    'step 0'
                    player.gainPlayerCard(target,'h',true);
                    'step 1'
                    if(result.bool){
                        player.storage.探囊_effect=result.cards[0];
                        player.addTempSkill('探囊_effect');
                    }
                },
                ai:{
                    order:10,
                    result:{
                        target:-1,
                        player:1,
                    },
                },
                subSkill:{
                    effect:{
                        charlotte:true,
                        onremove:true,
                        trigger:{
                            player:"useCardAfter",
                        },
                        forced:true,
                        popup:false,
                        filter:function(event,player){
                            return event.cards && event.cards.contains(player.storage.探囊_effect);
                        },
                        content:function(){{
                            var stat = player.getStat().skill;
                            delete stat.探囊_effect;
                            game.log(player, "重置了技能", "#g【探囊】");
                            }
                        },
                        sub:true,
                        sourceSkill:"探囊",
                        "_priority":0,
                    },
                },
                "_priority":0,
            },
            "誓仇":{
                audio:"ext:金庸:2",
                trigger:{
                    global:"damageAfter",
                },
                filter:function(event,player){
                    return event.card && (event.card.name=='sha' || event.card.name=='juedou') && 
                           event.source && event.source!=player && player.countCards('he')>0;
                },
                check:function(event,player){
                    return get.attitude(player,event.source)<0;
                },
                content:function(){
                    'step 0'
                    player.chooseToDiscard('he',true,'誓仇：请弃置一张牌').set('ai',function(card){
                        return 6-get.value(card);
                    });
                    'step 1'
                    if(result.bool){
                        var target=trigger.source;
                        player.useCard({name:'sha',isCard:true},target,false);
                        player.addTempSkill('誓仇_draw');
                    }
                },
                subSkill:{
                    draw:{
                        trigger:{
                            source:"damageAfter",
                        },
                        forced:true,
                        popup:false,
                        filter:function(event,player){
                            return event.getParent(3).name=='誓仇';
                        },
                        content:function(){
                            player.draw();
                        },
                        sub:true,
                        sourceSkill:"誓仇",
                        "_priority":0,
                    },
                },
                "_priority":0,
            },
            "扶弱":{
                audio:"ext:金庸:2",
                trigger:{
                    global:"damageEnd",
                },
                filter:function(event, player) {
                    return event.source != player;
                },
                content:function() {
                    'step 0'
                    var target = trigger.source; // 直接使用造成伤害的角色
                    // 视为对目标使用一张无距离限制的【杀】
                    player.useCard({name: 'sha'}, target);
                },
                mark:true,
                intro:{
                    content:function(storage, player) {
                        return '扶弱：当一名角色受到伤害后，若伤害来源不是你，你可以立即视为对伤害来源使用一张无距离限制的【杀】。';
                    },
                },
                "_priority":0,
            },
            "飞石":{
                audio:"ext:金庸:2",
                trigger:{
                    player:"useCardAfter",
                },
                filter:function(event,player){
                    return event.card&&event.card.isCard&&get.type(event.card)=='basic';
                },
                direct:true,
                content:function(){
                    'step 0'
                    player.chooseTarget(get.prompt('飞石'),function(card,player,target){
                        return player.canUse({name:'sha'},target,false);
                    }).set('ai',function(target){
                        return get.effect(target,{name:'sha'},player,player);
                    });
                    'step 1'
                    if(result.bool){
                        player.logSkill('飞石',result.targets);
                        player.useCard({name:'sha'},result.targets[0],false);
                    }
                },
                ai:{
                    threaten:1.5,
                    expose:0.2,
                },
                "_priority":0,
            },
        },
        translate:{
            "智子":"智子",
            "智子_info":"每个回合开始时可以指定一名角色，该角色手牌终对你可见直到游结束",
            "昭然":"昭然",
            "昭然_info":"每个回合开始时可以指定一名角色，该角色手牌始终对所有角色可见直到游戏结束",
            "运粮":"运粮",
            "运粮_info":"摸牌阶段，你可以选择一项执行：1.少摸一张牌，令一名角色将手牌补至其当前体力值；2.放弃摸牌，令一名角色将手牌补至其体力上限；3.不发动技能，结束步骤",
            "探囊":"探囊",
            "探囊_info":"回合开始阶段，你可以视为使用一张无距离限制顺手牵羊，然后你可以使用该牌，若你使用了该牌，则可以再次发动此技能",
            "誓仇":"誓仇",
            "誓仇_info":"当一名角色造成伤害后，若伤害来源不是你，你可以弃置一张牌，视为对伤害来源使用一张无距离限制的【杀】。",
            "扶弱":"扶弱",
            "扶弱_info":"当一名角色受到伤害后，若伤害来源不是你，你可以立即视为对伤害来源使用一张无距离限制的【杀】。",
            "飞石":"飞石",
            "飞石_info":"在你使用一张基本牌后，你可以视为对一名角色使用一张不限制距离的【杀】。",
        },
    },
    intro:"",
    author:"无名玩家",
    diskURL:"",
    forumURL:"",
    version:"1.0",
},files:{"character":[],"card":[],"skill":[],"audio":[]}}
});