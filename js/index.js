//判断访问终端
var browser={
    versions:function(){
        var u = navigator.userAgent, app = navigator.appVersion;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
            qq: u.match(/\sQQ/i) == " qq" //是否QQ
        };
    }(),
    language:(navigator.browserLanguage || navigator.language).toLowerCase()
}
/**
 * Created by cMing on 2016/11/3.
 */
var nav = document.getElementById('nav');
var search_box = document.getElementById('search_box');
var navWidth = parseFloat(getComputedStyle(nav).width);
var startX = 0,startY=0;
var endX=0,endY=0;
var timer = null;
var isMobile = false;
if(browser.versions.mobile||browser.versions.android||browser.versions.ios){isMobile = true;}
var mask = document.getElementById('mask');
var  link_container = document.getElementsByClassName('link_container')[0];
var main = document.getElementById('main');
link_container.style.width = window.innerWidth - parseFloat(getComputedStyle(main).paddingLeft) + 'px';
window.document.addEventListener('touchstart',function(e){
    var target = e.target || e.srcElement;
    startX = e.targetTouches[0].pageX;
    startY = e.targetTouches[0].pageY;
    while(target.nodeName!=='SECTION' && target.parentNode){
        target = target.parentNode;
    }
    if(target.id==='main'){timer = setTimeout(function(){showSearch()},800)}
});
var originX = getOffset(nav);
window.document.addEventListener('touchmove',function(e){
    var sx = startX;
    var sy = startY;
    endX = e.targetTouches[0].pageX;
    if(getComputedStyle(mask).zIndex<0 && Math.abs(sx-endX)>50){
       transform(nav,'matrix(1,0,0,1,'+ (originX-(sx-endX)) +',0)')
    }
    if(Math.abs(endX-sx)===0 && Math.abs(endY-sy)===0){
        endX=0;endY=0;
    }else{
        clearTimeout(timer)
    }
},false);
window.document.addEventListener('touchend',function(e){
    clearTimeout(timer);timer = null;
    nav.className = 'sliderEnd';
    var target = e.target;
    while(target.id!=='nav' && target.parentNode){
        target = target.parentNode;
    }
    getOffset(nav) > -100? transform(nav,'matrix(1,0,0,1,0,0)'):hideNav();
    (target.id!=='nav' && getOffset(nav)===0)&&hideNav();
    startX=0;startY=0;endX=0;endY=0;
},false);
function hideNav(){
    transform(nav,'matrix(1,0,0,1,'+-Math.ceil(navWidth)+',0)')
    nav.addEventListener('transitionend',function(){
        this.removeEventListener('transitionend',arguments.callee);
    });
}

nav.addEventListener('transitionend',function(){
    nav.className='';
    originX = getOffset(nav);
});
window.document.addEventListener('keydown',function(e){
    if(e.code ==='Space'){
        showSearch();
    }
    if(e.code ==='Escape' && getComputedStyle(mask).zIndex>0){
        hideSearch();
    }
},false);
window.addEventListener('resize',function(){
    link_container.style.width = window.innerWidth - parseFloat(getComputedStyle(main).paddingLeft) + 'px';
},false)
mask.addEventListener(isMobile?'touchend':'click',function(e){//移动端在touchend之后出现mask会触发click事件
    var target  = e.target || e.srcElement;
    if(target.id==='mask'){hideSearch()}
},false);
var handbook = document.getElementById('handbook');
document.getElementById('handbook_btn').addEventListener('click',function(e){
    e.preventDefault();
    handbook.style.display = 'block';
},false);
handbook.addEventListener('click',function(e){
    if(e.target.id==='handbook'){
        this.style.display = 'none';
    }
},false)
function showSearch(){
    var input = search_box.getElementsByTagName('input')[0];
    mask.style.zIndex = 1000;
    mask.style.backgroundColor = 'rgba(0,0,0,0.3)';
    transform(search_box,'translateY(0)');
    setTimeout(function(){input.focus()},200)
}
function hideSearch(){
    var input = search_box.getElementsByTagName('input')[0];
    input.blur();
    transform(search_box,'translateY(-100%)');
    mask.style.backgroundColor = 'rgba(0,0,0,0.01)';
    mask.addEventListener('transitionend',function(){
        this.style.zIndex = -1;
        this.removeEventListener('transitionend',arguments.callee);
    },false);
}


//vue:
var ipt = new Vue({
    el:'#search',
    data:{
        keywords:'',
        result:[],
        bmList:[]
    },
    watch:{
        result:function(){
            if(this.result.length>0){
                search_box.style.bottom = 0;
            }else{
                search_box.style.bottom = '';
            }
        }
    },
    methods:{
        search:function(e){
            this.result = [];
            if(!this.keywords.trim()){return false}
            var reg = new RegExp(this.keywords,'gi');
            for(var i=0;i<this.bmList.length;i++){
                var bm = this.bmList[i];
                if(reg.test(bm.t) || reg.test(bm.d)){
                    this.result.push(bm);
                }
            }
        },
        clear:function(){
            this.result = [];
            this.keywords ='';
            return false;
        }
    }
});
function getOffset(ele){
    var reg = /matrix\(\s?1,\s?0,\s?0,\s?1,([^,]+),\s?0\)/;
    return parseFloat(getComputedStyle(nav).transform.match(reg)[1]);
}
/*滚动条*/
Scrollbar.init(document.getElementsByClassName('scl_container')[0],{
    overscrollEffect:'bounce'
});
Scrollbar.init(document.getElementsByClassName('result_container')[0],{
    overscrollEffect:'bounce'
});
Scrollbar.init(document.getElementsByClassName('link_container')[0],{
    overscrollEffect:'glow'
});
Scrollbar.init(document.getElementsByClassName('bandbook_container')[0],{
    overscrollEffect:'bounce'
});
document.getElementsByClassName('link_container')[0].style.overflowX='visible';
document.getElementsByClassName('link_container')[0].style.overflowY='hidden';
//书签整理:
var bookmarks = window.bookmarks;
var bookmarksOrigin = '';
window.document.addEventListener('dragover',function(e){
    e.preventDefault();
    // e.dataTransfer.dropEffect = 'copy';
},false);
window.document.addEventListener('drop',function(e){
    e.preventDefault();
    if(e.dataTransfer.files[0].type!=='text/html'){
        alert('请拖入书签导出的HTML文件!')
        return false;
    }
    var reader = new FileReader();
    reader.readAsText(e.dataTransfer.files[0]);
    reader.onload = function(){
        bookmarksOrigin = this.result;
        bookmarks = [];
        dealStr(bookmarksOrigin);
        watchMark.bookmarks = bookmarks;
        marks.list = bookmarks[0].b;
        // document.getElementsByClassName('scroll-content')[0].style.transform = 'translate3d(0,0,0);'
        transform(document.getElementsByClassName('scroll-content')[0],'translate3d(0,0,0)')
        save.show = true;
        ipt.bmList = getBmList(bookmarks);
        /*这里可以考虑使用webworker*/
    }
},false);
function dealStr(str){//所有处理书签的逻辑
    str  = dealSim(str);
    if(checkBrowser(str)==='mozilla'){
        str = cutMozilla(str);
    }
    divDL(bookmarks,cutHeadFoot(str));
    function divDL(arr,str){

        var obj = {};
        obj.h = (str.match(/^<H3>([\s|\S]+?)<\/H3>/))[0].slice(4,-5);
        str = cutHeadFoot(str);
        if(str.slice(0,20).indexOf('gulp')!==-1){
            console.log('ok')
        }
        var result = findAllG(str);
        if(result.length>0){
            obj.f = [];
            for(var i=0;i<result.length;i++){
                divDL(obj.f,result[i]);
            }
            str = removeH3Dl(str);
        }
        obj.b = getDt(str);
        arr.push(obj);
    }
    function findAllG(str){
        var arr = [];
        var len= str.length;
        var cache = '';
        var chacheObj = {};
        while(chacheObj = digDLFoot(str)){
            arr.push(chacheObj.cache);
            str = str.slice(chacheObj.end);
        }
        function digDLFoot(str){
            var start = str.indexOf('<H3>');
            var end = str.indexOf('</DL>',start);
            var cache = str.slice(start,end+5);
            var result = cache.match(/<DL>/g);
            if(result){
                while(cache.match(/<DL>/g).length !== cache.match(/<\/DL>/g).length){
                    end = str.indexOf('</DL>',end+5);
                    cache = str.slice(start,end+5);
                }
                return {
                    cache:cache,
                    end:end+5//这里必须返回end值来记录要截取的数量
                };
            }else {
                return false;
            }
        }
        return arr;
    }
    function cutHeadFoot(str){
        str = str.replace(/^[\S|\s]*?<DL>/,'');
        str = str.slice(0,str.lastIndexOf('<\/DL>'));
        return str;
    }
    function removeH3Dl(str){
        return str.replace(/<H3>[^<]*<\/H3><DL>[\s|\S]+<\/DL>/ig,'');//删除h3和dl的兄弟元素
    }
    function getDt(str){
        var dtList = [];
        var dtListStr = str.match(/<A\sHREF="([^"]+)">([^<]*)<\/A>/g);
        if(dtListStr){
            for(var i=0;i<dtListStr.length;i++){
                var result = dtListStr[i].match(/<A\sHREF="([^"]+)">([^<]*)<\/A>/);
                var name = result[2],tit='',desc='';
                if(name){
                    var nameResult = name.match(/^([^,，·\-\_:\|]+)[,，·\s\-\_:\|]*(.*)/);
                    if(nameResult){
                        tit = nameResult[1];
                        desc = nameResult[2];
                    }else{
                        tit = name;
                        desc = '';
                    }
                }else{
                    tit = '';
                    desc = '';
                }
                dtList[dtList.length] = {
                    a:result[1],
                    t:tit,
                    d:desc
                };
            }
        }
        return dtList;
    }
    function dealSim(str){
        str = str.replace(/<DT>|<p>|ADD_DATE="\w+"|ICON="[^"]+"|LAST_MODIFIED="\w+"/g,'');//去掉垃圾信息
        str = str.replace(/[\s|\S]+<\/H1>/,'');//去掉h1前面所有
        str = str.replace(/>\s*</g,'><');//去掉><之间空格
        str = str.replace(/<H3[^>]+>/g,'<H3>');//去掉h3之间的多余信息
        str = str.replace(/\s{2,}/g,' ');//压缩空格
        str = str.replace(/\s+>/g,'>');
        return str.trim();
    }
    function checkBrowser(str){
        var mozilla = /<HR><H3>Mozilla/i;//第一个h3为mozila
        if(mozilla.test(str)){
                return 'mozilla';
            }
    }
    function cutMozilla(str){
        // str = str.replace(/(<\/DL>)\1$/g,'</DL>');
        return str.replace(/<DL>[\s|\S]+?<\/DL>/i,'<DL>');
    }
}
Vue.component('item',{
    template: '#item-template',
    props: {
        model: Object
    },
    data: function () {
        var boolean = false;
        if(this.model.h==='收藏栏' || this.model.h==='书签栏'){
            boolean = true;
        }
        return {
            open:boolean
        }
    },
    computed: {
        isFolder: function () {
            if(this.model.f){
                return true;
            }else{
                return false;
            }
        }
    },
    methods: {
        toggle: function () {
            if (this.isFolder) {
                this.open = !this.open;
            }

        },
        getDt:function(){
            marks.list = this.model.b;
            //将列表内的滚动条置0;
            link_container.getElementsByClassName('scroll-content')[0].style.transform = 'translate3d(0,0,0)'
        }
    }
})
var marks = new Vue({
    el:'#linkList',
    data:{
        list:[]
    }
});
var watchMark = new Vue({
    el: '#nav_folder',
    data:{
        bookmarks: bookmarks[0]?bookmarks[0].f:[]
    }
})
var save = new Vue({
    el:'#save',
    data:{
        hash:'',
        show:false
    },
    methods:{
        save:function () {
            var me = this;
            if(this.hash && !testHash(this.hash)){
                alert('请重新验证后缀名!');
                return false;
            }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if(xhr.readyState ===4 && xhr.status === 200){
                    var text = xhr.responseText;
                    if(text !== '-1'){
                        this.show = false;
                        alert('书签保存成功!点击确定为您跳转到新的书签导航页:\nhttp://webmarker.youledi.cn/#'+text);
                        window.location.href = 'http://webmarker.youledi.cn/#'+text;
                        window.location.reload();
                    }else{
                        alert('书签保存失败..请充实==重试');
                    }
                }
            }
            xhr.open('POST','data/add_bm.php',true);
            var data = {bookmarks:bookmarks,hash:''};
            data.hash = this.hash;
            if(bookmarks.length>0){
                xhr.send(JSON.stringify(data));
            }else{
                alert('您的书签为空,无法保存!');
            }
        },
        check:function(){
            if(this.hash){
                if(!testHash(this.hash)){
                    alert('后缀名命名规则遵循JS变量命名规则,请重新输入!');
                    return false;
                }
            }else{
                alert('如果后缀名为空,系统将自动为您分配随机的后缀名');
                return false;
            }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if(xhr.readyState ===4 && xhr.status === 200){
                    if(xhr.responseText === '1'){
                        alert('恭喜,该后缀名可用!');
                    }else{
                        alert('抱歉,该后缀名已存在,如果需要覆盖可直接点保存');
                    }
                }
            }
            xhr.open('POST','data/query_bm.php',true);
            xhr.send(this.hash);
        }
    }
});
!function(){
    var hash = window.location.hash.slice(1);
    // var xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = function (){
    //     if(xhr.readyState ===4 && xhr.status ===200){
    //         var obj = JSON.parse(xhr.responseText);
    //         bookmarks = watchMark.bookmarks = obj;
    //         marks.list = bookmarks[0].b;
    //         ipt.bmList = getBmList(bookmarks);
    //     }
    // };
    // xhr.open('POST','data/get_bm.php',true);
    // xhr.send(JSON.stringify({hash:hash}));
    // bookmarks = window.bookmarks
}();
function getBmList(arr){
    var list = [];
    getF(arr);
    function getF(arr){
        for(var i=0;i<arr.length;i++){
            if(arr[i].b){
                getB(arr[i].b);
            }
            if(arr[i].f){
                getF(arr[i].f)
            }
        }
    }
    function getB(arr){
        for(var i=0;i<arr.length;i++){
            list.push({
                a:arr[i].a,
                d:arr[i].d,
                t:arr[i].t
            });
        }
    }
    return list;
}
function testHash(str){
    var reg = /^[a-zA-Z\$_][$_\w]*$/;
    return reg.test(str);
}
var targetChange = new Vue({
    el:'#targetChange',
    data:{
        newTarget:false,
        targetELe:document.querySelector('[target]'),
        ele:document.getElementById('targetChange')
    },
    created:function(){
        if(!window.localStorage){return}
        if(window.localStorage.getItem('newTarget') == 'true'){
            this.ele.innerHTML = '在新标签页打开';
            this.targetELe.setAttribute('target','_blank');
            this.newTarget = true;
        }else{
            this.ele.innerHTML = '在本标签页打开';
            this.targetELe.setAttribute('target','_self');
            this.newTarget = false;
        }
    },
    methods:{
        change:function(){
            this.newTarget = !this.newTarget;
            if(this.newTarget){
                this.$el.innerHTML = '在新标签页打开';
                this.targetELe.setAttribute('target','_blank');
            }else{
                this.$el.innerHTML = '在本标签页打开';
                this.targetELe.setAttribute('target','_self');
            }
            if(!window.localStorage){return}
            console.log(this.newTarget)
            window.localStorage.setItem('newTarget',this.newTarget);
        }
    }
});

//兼容性封装
function transform(ele,prop){
    var arr = ['transform','WebKitTransform','MozTransform','OTransform','MsTransform'];
    for(var i=0;i<arr.length;i++){
        ele.style[arr[i]] = prop;
    }
}