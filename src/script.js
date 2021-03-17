var sound_url = "https://awiclass.monoame.com/pianosound/set/";
var music_url = ["https://awiclass.monoame.com/api/command.php?type=get&name=music_star", "https://awiclass.monoame.com/api/command.php?type=get&name=music_dodoro"];
var soundpack_index = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,8,8.5,9,9.5,10,11,11.5,12,12.5,13,13.5,14,15];
var soundpack = [];

for (var i=0;i<soundpack_index.length;i++){
  soundpack.push({note: soundpack_index[i], source: sound_url + soundpack_index[i] + ".wav"})
};

const vm = Vue.createApp({
  data () {
    return {
      sounds: soundpack,
      music: {name: "", notes: ""},
      code: -1,
      tag: 0,
      now_time: 0,
      record_now_time: 0,
      now_note: 0,
      player: null,
      recoerder: null,
      status: "",
      isNaming: false,
      note2keys: [
      {num: 1, key: 81, type:'white', value: "Q", name: "C2"},
      {num: 1.5, key: 49, type:'black', value: "!1", name: "C2♯"},
      {num: 2, key: 87, type:'white', value: "W", name: "D2"},
      {num: 2.5, key: 50, type:'black', value: "@2", name: "D2♯"},
      {num: 3, key: 65, type:'white', value: "A", name: "E2"},
      {num: 4, key: 83, type:'white', value: "S", name: "F2"},
      {num: 4.5, key: 69, type:'black', value: "E", name: "F2♯"},
      {num: 5, key: 68, type:'white', value: "D", name: "G2"},
      {num: 5.5, key: 82, type:'black', value: "R", name: "G2♯"},
      {num: 6, key: 70, type:'white', value: "F", name: "A2"},
      {num: 6.5, key: 84, type:'black', value: "T", name: "A2♯"},
      {num: 7, key: 86, type:'white', value: "V", name: "B2"},
      {num: 8, key: 78, type:'white', value: "N", name: "C3"},
      {num: 8.5, key: 85, type:'black', value: "U", name: "C3♯"},
      {num: 9, key: 74, type:'white', value: "J", name: "D3"},
      {num: 9.5, key: 73, type:'black', value: "I", name: "D3♯"},
      {num: 10, key: 75, type:'white', value: "K", name: "E3"},
      {num: 11, key: 76, type:'white', value: "L", name: "F3"},
      {num: 11.5, key: 57, type:'black', value: "(9", name: "F3♯"},
      {num: 12, key: 186, type:'white', value: ":;", name: "G3"},
      {num: 12.5, key: 48, type:'black', value: ")0", name: "G3♯"},
      {num: 13, key: 79, type:'white', value: "O", name: "A3"},
      {num: 13.5, key: 189, type:'black', value: "_-", name: "A3♯"},
      {num: 14, key: 80, type:'white', value: "P", name: "B3"},
      {num: 15, key: 219, type:'white', value: "{[", name: "C4"}]
    }
  },
  computed:{
    keyboards: function(){
      var key2num = [];
      for (var i=0; i<this.note2keys.length; i++){
        key2num.push(this.note2keys[i].key);
      };
      return key2num;
    }
  },
  methods: {
    play: function(id,volumn){
      var audio_obj = $('audio[data-num="' + id + '"]')[0];
      var robj = this;
      audio_obj.volumn = volumn;
      audio_obj.currentTime = 0;
      audio_obj.play();
      
      if (robj.record_now_time > 0){
        var num2name = "";
        for(var j=0; j<robj.note2keys.length; j++){
          if(id == robj.note2keys[j].num){
            num2name = robj.note2keys[j].name;
          };
        };
        robj.music.notes.push({num: id, time: robj.record_now_time, name: num2name}); 
      };
    },
    load_sample: function(flag){
      var vobj = this;
      vobj.now_note = 0;
      if( vobj.tag == 0){
        vobj.music.name = "Little Star";
      } else {
        vobj.music.name = "DoDoRo";
      };
      vobj.tag = ((vobj.tag == 0) ? 1 : 0);
      $.ajax({
        url: music_url[flag],
        success: function(res){
          vobj.music.notes = JSON.parse(res);
          for(var i=0; i<vobj.music.notes.length; i++){
            for(var j=0; j<vobj.note2keys.length; j++){
              if(vobj.music.notes[i].num == vobj.note2keys[j].num){
                vobj.music.notes[i].name = vobj.note2keys[j].name;
              };
            };
          };
        }
      });
    },
    play_single: function(){
      var context = this.music.notes;
      var now = this.now_note;
      var play_id = context[now].num;
      var play_time = context[now].time;
      var last_time = (now >= context.length-1) ? 310 : (context[now+1].time - context[now].time);
      
      this.play(play_id,1);
      $("[data-key='" + play_id + "']").addClass("pressing");
      $("[data-time='" + play_time + "']").addClass("highlight");
      setTimeout(function(){
        $("[data-key='" + play_id + "']").removeClass("pressing");
        $("[data-time='" + play_time + "']").removeClass("highlight");
      }, last_time)
        
      
      
      if(now >= context.length-1){
        clearInterval(this.player);
        this.now_note = 0;
        this.now_time = 0;
        this.status = "";
        now = this.now_note - 1;
      } else {
        this.now_time = play_time;
        this.now_note++;
      };
    },
    // 每次計時，計時器可能會因為電腦有其他任務而被延緩執行
    // 修正辦法可參考
    // https://www.itread01.com/content/1548126008.html
    // 此處無修改是因為範例樂譜所用的計時器也有偏誤，負負得正
    play_all: function(){
      var vobj = this;
      vobj.status = "playing";
      vobj.now_note = 0;
      vobj.player = setInterval(function(){
        vobj.now_time++;
        if (vobj.now_time >= vobj.music.notes[vobj.now_note].time){
          vobj.play_single();
        };
      },1);
    },
    clear: function(){
      clearInterval(this.player);
      clearInterval(this.recorder);
      this.now_note = 0;
      this.now_time = 0;
      this.record_now_time = 0;
      this.status = "";
      this.music = {name: "", notes: ""};
    },
    stop: function(){
      clearInterval(this.player);
      clearInterval(this.recorder);
      this.status = "stop";
    },
    resume: function(){
      var vobj = this;
      if (vobj.now_time > 0){
        vobj.status = "playing";
        vobj.player = setInterval(function(){
          vobj.now_time++;
          if (vobj.now_time >= vobj.music.notes[vobj.now_note].time){
            vobj.play_single();
          };
        },1);
      } else {
        vobj.status = "recording";
        vobj.recorder = setInterval(function(){
          vobj.record_now_time++;
        },1);
      };
    },
    record: function(){
      var vobj = this;
      vobj.now_time = 0;
      vobj.record_now_time = 0;
      vobj.status = "recording";
      vobj.music = {name: "New Melody", notes: []};
      vobj.player = null;
      vobj.recorder = setInterval(function(){
        vobj.record_now_time++;
      }, 1);
    },
    stop_record: function(){
      clearInterval(this.recorder);
      this.recorder = null;
      this.record_now_time = 0;
      this.status = "";
    },
    naming: function(){
      this.isNaming = true;
      $("input").css("display", "block")
    }
  }
}).mount("#app");

$(window).keydown(function(evt){
  var code = evt.which;
  var obj = vm.$data;
  if(document.activeElement.id != "melody_name"){
    for (var i=0; i<obj.note2keys.length; i++){
      if(code == obj.note2keys[i].key){
        var press_id = obj.note2keys[i].num;
        var keyboard_obj = $("[data-key='" + press_id + "']");
        vm.play(press_id,1);
        keyboard_obj.addClass("pressing");
        setTimeout(function(){
          keyboard_obj.removeClass("pressing");
        },200);
      };
    };
  } else {
    if(code == 13){
      $("input").css("display", "none");
      obj.isNaming = false;
    };
  };
});

$(document).on("mouseenter", "li", function(){
  var num = $(this).attr("data-id");
  var piano_key = $("[data-key='" + num + "']");
  if(vm.$data.status != ("playing" || "recording")){
    $(this).addClass("highlight");
    piano_key.addClass("pressing");
  };
});
$(document).on("mouseleave", "li", function(){
  var num = $(this).attr("data-id");
  var piano_key = $("[data-key='" + num + "']");
  if(vm.$data.status != ("playing" || "recording")){
    $(this).removeClass("highlight")
    piano_key.removeClass("pressing");
  };
});