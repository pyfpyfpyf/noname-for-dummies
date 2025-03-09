import { lib, game, ui, get, ai, _status } from "../../noname.js";
game.import("extension",function(){
	return {name:"无名扩展",content:function(config,pack){
    
},precontent:function(){
    
},help:{},config:{},package:{
    character:{
        character:{
            "周":["male","wei",3,["互"],[]],
        },
        translate:{
            "周":"周",
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
            "互":{
                audio:2,
                trigger:{
                    global:"gameStart",
                    player:"phaseBeginStart",
                },
                forced:true,
                content:function() {
        'step 0'
        // 游戏开始时直接发动，回合开始时询问
        if(trigger.name ==  "global:'gameStart'"){
            // 直接执行技能逻辑
            if(player.storage.fadonging){
                for(var i=0;i<player.storage.fadonging.length;i++){
                    player.removeSkill(player.storage.fadonging[i]);
                }
                delete player.storage.fadonging;
            }
            event.goto(2); // 跳转到获取武将牌的步骤
            return;
        }
        
        // 回合开始时询问是否发动
        player.chooseControl('是','否').set('prompt','是否发动【发动】？');
        'step 1'
        if(result.control=='否'){
            event.finish();
            return;
        }

        // 如果选择是，则移除之前获得的技能
        if(player.storage.fadonging){
            for(var i=0;i<player.storage.fadonging.length;i++){
                player.removeSkill(player.storage.fadonging[i]);
            }
            delete player.storage.fadonging;
        }

        'step 2'
        // 获取两张随机武将牌
        var list = [];
        var list2 = [];
        var players = game.players.concat(game.dead);
        for (var i = 0; i < _status.characterlist.length; i++) {
            var name = _status.characterlist[i];
            if (players.includes(name)) continue;
            var skills = lib.character[name][3];
            list2.push(name);
        }
        _status.characterlist.randomSort();
        var names = list2.randomGets(2);
        event.names = names;

        var skills = [];
        for (var name of names) {
            skills.addArray(lib.character[name][3]);
        }
        event.skills = skills;

        // 展示武将牌
        var dialog = ui.create.dialog('继承', 'hidden');
        dialog.add([names, 'character']);
        player.chooseControl(skills).set('dialog', dialog).set('ai', function() {
            var skills = _status.event.controls;
            return skills.randomGet();
        });

        'step 3'
        var skill = result.control;
        // 获得所选技能并记录
        player.addSkill(skill);
        if(!player.storage.fadonging) player.storage.fadonging = [];
        player.storage.fadonging.push(skill);
        player.popup(skill);
        game.log(player, '获得了技能', '#g【' + get.translation(skill) + '】');

        'step 4'
        // 移除已选择的武将牌和技能
        event.skills.remove(result.control);
        event.dialog = ui.create.dialog('继承', 'hidden');
        event.dialog.add([event.names, 'character']);
        player.chooseControl(event.skills).set('dialog', event.dialog).set('ai', function() {
            var skills = _status.event.controls;
            return skills.randomGet();
        });

        'step 5'
        if (result.control) {
            var skill = result.control;
            player.addSkill(skill);
            player.storage.fadonging.push(skill);
            player.popup(skill);
            game.log(player, '获得了技能', '#g【' + get.translation(skill) + '】');
        }
    },
            },
        },
        translate:{
            "互":"互",
            "互_info":"",
        },
    },
    intro:"",
    author:"无名玩家",
    diskURL:"",
    forumURL:"",
    version:"1.0",
},files:{"character":["周.jpg"],"card":[],"skill":[],"audio":[]}}
});