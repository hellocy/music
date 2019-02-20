/**
 * @author bareman
 */
function randomsort(a, b) {  
    return Math.random()>.5 ? -1 : 1;  
} 

var lrc = [],flag = 0;
	
$(function(){
	var max = 18,i = parseInt(((parseInt(Math.random()*10) + 1) / 10) * max),a = [],j = 0;
    
    for(var k = 1; k <= max; k++){
        a.push(k);
    }
    a = a.sort(randomsort);
    var initBgIndex = "img/1.jpg";
    $("#bgImg").attr("src",initBgIndex);
    
	setInterval(function(){ 
		
        j = j >= max ? 0 : j;
        
        $("#bgImg").fadeOut(3000,function(){
           var idx = a[j++];
			$("#bgImg").attr("src","img/"+idx +".jpg").unbind().load(function(){
				$(this).fadeIn(6000);
			});
		});
		
	},15000);
});
		
window.onload = function(){
	
	var winH = $(window).height();
	$(".listWrap,.songWrap,.img-lrc").css("max-height",winH - 150);
	$(".lrcWrap").css("height",  winH - 330);
	
	
	var myAudio = document.getElementById('myaudio');
	var total = $(".bar").width();
	var volume = document.getElementById("volume");
	var musicBox = [];
	musicBox = getSongList();
	var index = 0;
	var module = false; //是否随机播放
	
	myAudio.addEventListener("loadstart",function(){
		if($(".proBar").length)
			$(".proBar").width(0).removeClass("playingBar").addClass("loadingBar");
	});
	
	myAudio.addEventListener("progress",function(){
		if($(".proBar").length)
			$(".proBar").removeClass("loadingBar").addClass("playingBar");
	});
	
	var history = 0;
	myAudio.addEventListener('timeupdate', function() {
		var progress = (total * (this.currentTime / this.duration));
		var currentTime = timer(this);
		if(lrc.length){
			var idx = 0;
			for(var k = 0; k < lrc.length;k++){
				if(this.currentTime > lrc[k][0]){
					idx = k;
				}else{
					continue;
				}
			}
			if(history != idx){
				var $lcrIdx = $("[time = '"+lrc[idx][0]+"']");
				var $currentLrc = $lcrIdx.text();
				if($lcrIdx.length && $currentLrc.length){
					$(".lrcWrap li").css({"color" : "#fff"});
	                $lcrIdx.css({"color" : "rgba(0, 100, 250, 1)"});
					$(".lrcWrap").animate({"scrollTop" : $lcrIdx.index() * 40 - 50},1000);
	                //$(".lrcWrap").scrollTop($lcrIdx.index() * 40 - 50);
	                var songName = $(".songList li:eq(" + (index)+ ") .songName").text();
	                var title = $currentLrc.length ? $currentLrc + " - " + songName : songName;
	                $("title").text(title + " - 最爱陈奕迅（Eason Chan）");
				}
				history = idx;
			}
		}
		
		$(".currentTime").html(currentTime);
		$(".proBar").width(progress);
	}, false);
	
	myAudio.addEventListener('ended', function() {
		index++;
		index = index >= musicBox.length ? 0 : index;
		
		$(".songImg img").hide();
		
		if(module){
			var len = musicBox.length;
			var random = parseInt(((parseInt(Math.random()*10) + 1) / 10) * (len - 1));
			index = random;
		}
		var musicName = musicBox[index];
		setTimeout(function(){
			play(myAudio,index,musicName);
		},1000);
	});
	
	$(".loop").click(function(){
		module = false;
		$("#myaudio").attr("loop","loop");
		$(".module .fa").css({
			"color" : "#fff"
		});
		$(".module .loop .fa").css({
			"color" : "blue"
		});
		
	});
	
	$(".random").click(function(){
		module = true;
		$("#myaudio").removeAttr("loop");
		$(".module .fa").css({
			"color" : "#fff"
		});
		$(".module .random .fa").css({
			"color" : "blue"
		});
		
	});
	
	$(".queue").click(function(){
		module = false;
		$("#myaudio").removeAttr("loop");
		$(".module .fa").css({
			"color" : "#fff"
		});
		$(".module .queue .fa").css({
			"color" : "blue"
		});
		
	});
	
	//单击进度条任意位置，跳播
	$(".bar").click(function(e){
		var x = ((e.clientX - $(this).offset().left) / total) * myAudio.duration;
		myAudio.currentTime = x;
	});
	
	$(".songList li").click(function(){
		index = $(this).index();
		var musicName = musicBox[index];
		play(myAudio,index,musicName);
       flag = 1;
	});
	
	volume.addEventListener('change', function() {
		var volume = this.value;
		myAudio.volume = volume;
	},false);
	
	$(".play-pause").click(function(){
		myAudio.volume = $("#volume").val();
		$(".songList li:eq(" + (index)+ ")").append($(".playing"));
		if(flag == 0){
			myAudio.play();
			$(".play-pause .fa").removeClass("fa-play-circle-o").addClass("fa-pause-circle-o");
			$(".playing div,.songImg img").show().css({
				"animation-play-state" : "running"
			});

			$(".songList li:eq("+index+")").append($(".playing").show());
			var path = "mp3/";
			var musicName = musicBox[index];
			getLyric(musicName.split(".")[0]);
			flag = 1;
		}else{
			myAudio.pause();
			$(".songList li").each(function(){
				$(this).css({
					"background" : ""
				});
			});
			$(".play-pause .fa").removeClass("fa-pause-circle-o").addClass("fa-play-circle-o");
			
			$(".playing div,.songImg img").css({
				"animation-play-state" : "paused"
			});
			
			flag = 0;
		}
		
	});
	
	$(".lastBtn").click(function(){
		index--;
		index = index < 0 ? musicBox.length  - 1 : index;
		var musicName = musicBox[index];
		play(myAudio,index,musicName);
		flag = 1;
	});
	
	$(".nextBtn").click(function(){
		index++;
		index = index >= musicBox.length ? 0 : index;
		var musicName = musicBox[index];
		play(myAudio,index,musicName);
		flag = 1;
	});
	
	$(".vIcon").click(function(){
		$("#volume").toggle();
		if($("#volume").is(":visible")){
			setTimeout(function(){
				$("#volume").fadeOut("slow");
			},5000);
		}
	});
};
	
function getSongList(){
	var songBox = [];
	$(".songList li").each(function(){
		var songName = $(this).attr("savename");
		if(songName){
			songBox.push(songName);
		}
	});
	return songBox;
}

function getSongList_mobile(){
	var songBox = [];
	$(".mobile .songList li").each(function(){
		var songName = $(this).attr("savename");
		if(songName){
			songBox.push(songName);
		}
	});
	return songBox;
}

function play(auto,index,name) {
	var path = "mp3/";
	var url = path + name;
	getLyric(name.split(".")[0]);
	$(".songImg img").attr("src","img/cyx.png").load(function(){
		$(this).fadeIn(3000);
	});
	$("#myaudio").attr("src",url);
	var $songNamePar = null;
	$songNamePar = $(".songList li:eq("+index+")");
	var $current = $songNamePar;
	var songName = $songNamePar.find(".songName").html();
	
	$(".songInfo span:first").html(songName + " ("+ (index + 1) +"/"+ ($(".songList li").length) +")");
	$("title").html(songName + " －最爱陈奕迅（Eason Chan）");
	$(".play-pause .fa").removeClass("fa-play-circle-o").addClass("fa-pause-circle-o");
	if($current){
		$current.append($(".playing").show());
	}
	
	$(".songWrap").animate({"scrollTop" : index * 40 - 265},1000);
	
	$(".playing div").css({
		"animation-play-state" : "running"
	});
	auto.play();
}

function timer(audio){
	var minu = parseInt((audio.duration - audio.currentTime) / 60);
	var sec =  parseInt((audio.duration - audio.currentTime) % 60);
	minu = minu < 10 ? "0" + minu : minu;
	sec = sec < 10 ? "0" + sec : sec;
	return minu + " : " + sec;
}

function getLyric(songName) {
    $(".lrcWrap ul").empty();
    var lrcLi = "";
  	lrc = parseLyric(lrcData[songName]);
    for(var i = 0;i< lrc.length;i++){
        var time = lrc[i][0],
            value = lrc[i][1];
        if(time){
            lrcLi += "<li time = '"+time+"'>"+value+"</li>";
        }
    }
    var finalLrc = "";
    if(lrcLi){
        finalLrc = lrcLi;
    }else{
        finalLrc = "<li>暂无歌词</li>";
    }
    $(".lrcWrap ul").append(finalLrc);
}

function parseLyric(text) {
    //将文本分隔成一行一行，存入数组
    var lines = text.split('\n'),
        //用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]
        pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
        //保存最终结果的数组
        result = [];
    //去掉不含时间的行
    while (!pattern.test(lines[0])) {
        lines = lines.slice(1);
    };
    //上面用'\n'生成生成数组时，结果中最后一个为空元素，这里将去掉
    lines[lines.length - 1].length === 0 && lines.pop();
    lines.forEach(function(v /*数组元素值*/ , i /*元素索引*/ , a /*数组本身*/ ) {
        //提取出时间[xx:xx.xx]
        var time = v.match(pattern),
            //提取歌词
            value = v.replace(pattern, '');
        //因为一行里面可能有多个时间，所以time有可能是[xx:xx.xx][xx:xx.xx][xx:xx.xx]的形式，需要进一步分隔
        if(time){
        	time.forEach(function(v1, i1, a1) {
	            //去掉时间里的中括号得到xx:xx.xx
	            var t = v1.slice(1, -1).split(':');
	            //将结果压入最终数组
	            result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
	        });
        }
    });
    //最后将结果数组中的元素按时间大小排序，以便保存之后正常显示歌词
    result.sort(function(a, b) {
        return a[0] - b[0];
    });
    return result;
}