if(!Element.fullFrameBackground){
    Element.implement({
        fullFrameBackground : function(image, callback){
            if(this.dummy && this.src == this.dummy.src){
                this.fullFrameBackground();
                return;
            }
            this.dummy = new Image();
            $(this).css('background-image', 'url('+image+')');
            $(this).css('background-position', 'center');
            jqel = $(this);
            if(!this.resizeToFit){
                this.resizeToFit = function(){
                    var theseDim = {
                        x : this.dummy.width,
                        y : this.dummy.height
                    };
                    //var thoseDim = $(this).size();
                    var thoseDim = {
                        x : jqel.width(),
                        y : jqel.height()
                    };
                    var aR = this.dummy.height/this.dummy.width;
                    var viewAR = thoseDim.y/thoseDim.x;
                    if(aR > 1){ //viewport orientation
                        if(aR < viewAR){ //blow up to fit hieght
                            $(this).css('background-size', ((aR)*thoseDim.y)+'px '+thoseDim.y+'px');
                        }else{ //blow up to fit width
                            $(this).css('background-size', thoseDim.x+'px '+((aR)*thoseDim.x)+'px');
                        }
                    }else{
                        if(aR < viewAR){ //blow up to fit hieght
                            $(this).css('background-size', Math.ceil((1/aR)*thoseDim.y)+'px '+thoseDim.y+'px');
                        }else{ //blow up to fit width
                            $(this).css('background-size', thoseDim.x+'px '+Math.ceil((aR)*thoseDim.x)+'px');
                        }
                    }
                    if(callback) callback();
                }.bind(this);
                this.dummy.onload = this.resizeToFit;
            }
            this.dummy.src = image;

        }
    });
}

var splash;

var minimumFontSize = 6;
function resizeFonts(){
    var scaleRatio = window.devicePixelRatio || 1;
    $(document.body).css('font-size', Math.max(((6 * ($(window).width()/256)^2)/4 + 6)*scaleRatio, minimumFontSize));
}

var c;

function showGallery(card, callback){
    var slides = [];
    $('span.context', card).each(function(index, item){
        var src = $(item).attr('context');
        var text = $(item).attr('text') || '';
        var image = new Image();
        image.setAttribute('class', 'context');
        image.setAttribute('alt', text);
        image.src = src;
        var width = $(window).width()/4.5;
        $(image).css('width', width);
        $(image).css('height', width*0.7);
        slides.push(image);
    });
    var gallery = $('#gallery');
    var plate = $('#gallery_plate');
    if(slides.length > 0){
        plate.show();
        gallery.empty();
        slides.forEach(function(slide){
            gallery.append(slide);
        })
        gallery.show();
        if(c) c.stop();
        plate.append(gallery);
        plate.append($('#gallery_info'));
        $('.orbit-wrapper').empty().remove();
        gallery.orbit({
            captions: true,
            pauseOnHover: true,
            bullets: true,
            startClockOnMouseOut: true,
            advanceSpeed: 8000,
            controls : function(controls){
                c = controls;
            },
            afterSlideChange: function(){
                $('#gallery_info').html(this.getAttribute('alt') || '');
            }
        });
        $('#gallery_info').html(slides[0].getAttribute('alt') || '');
        if(callback) callback(gallery);
    }else{
        gallery.hide();
        gallery.empty();
        if(c) c.stop();
        plate.hide();
        if(callback) callback(gallery);
    }
}

var cards = {};
var selectedCard;
function getCard(name, callback){
    if(cards[name]){
        callback(cards[name]);
    }else{
        new Request({
            url : 'Cards/'+name+'.html',
            method: 'get',
            onSuccess : function(data){
                cards[name] = data;
                callback(cards[name]);
            },
            onError : function(error){
                console.log('E!!', error);
            }
        }).send();
    }
}

function showCard(name, callback){
    getCard(name, function(card){
        var el = $('#info_plate');
        el.flippy({
            verso:card,
            color_target: 'rgba(0, 0, 0, 1)',
            direction:'RIGHT',
            duration:'500',
            onStart:function(){
            },
            onFinish:function(){
                el.css('background_color', 'rgba(0, 0, 0, 0.7)');
                el.css('opacity', 'inherit');
                showGallery(el, function(){

                });
            }
        });
    });
}

function cardInfo(name){
    var info = false;
    window.career.forEach(function(job){
        if(job.content.toLowerCase().replace(/ /g, '_') == name) info = job;
    });
    return info;
}

function timelineEventForName(text){
    var els = $('.timeline-event-content');
    var element = false;
    els.each(function(index, el){
        if($(el).html() == text){
            element = el;
        }
    });
    return element;
}

function nextCard(){
    var can;
    if(window.selectedCard){
        var current = window.selectedCard.start;
        window.career.forEach(function(job){
            if( job.start > current && ( (!can) || can.start > job.start )) can = job;
        });
    }else{
        window.career.forEach(function(job){
            if( (!can) || job.start < can.start) can = job;
        });
    }
    if(can){
        showCard(can.content.toLowerCase().replace(/ /g, '_'));
        window.selectedCard = can;
        $('.timeline-event').removeClass('selected');
        $(timelineEventForName(can.content)).parent().addClass('selected');

    }else resetCards();
}

function lastCard(){
    var can;
    if(window.selectedCard){
        var current = window.selectedCard.start;
        window.career.forEach(function(job){
            if( job.start < current && ( (!can) || can.start < job.start )) can = job;
        });
    }else{
        window.career.forEach(function(job){
            if( (!can) || job.start > can.start) can = job;
        });
    }
    if(can){
        showCard(can.content.toLowerCase().replace(/ /g, '_'));
        window.selectedCard = can;
        $('.timeline-event').removeClass('selected');
        $(timelineEventForName(can.content)).parent().addClass('selected');
    }else resetCards();
}

function resetCards(){
    showCard('home');
    $('.timeline-event').removeClass('selected');
    window.selectedCard = undefined;
    delete window.selectedCard;
}

$(document).ready(function(){
    var timelineElement = document.getElementById('timeline')
    var timeline = new links.Timeline(timelineElement);
    links.events.addListener( timeline, 'rangechanged', function(properties){
            //document.getElementById('info').innerHTML += 'rangechanged ' +
            //        properties.start + ' - ' + properties.end + '<br>';
    });
    $('timeline-event').on('click', function(){
        console.log(this);
    })

    splash = $('.splash')[0];

    splash.fullFrameBackground('./abbey_backyard_small.jpg');
    resizeFonts();
    var win = $(window);
    $('#gallery_info').css({
        'max-width': win.width()/4.5,
        'margin-bottom' : '0px',
        'margin-top' : '30px'
    });
    var jq_splash = $(splash);
    $('#gallery_plate').hide();
    $(window).on('resize', function(){
        jq_splash.css('height', window.innerHeight);
        splash.resizeToFit();
        resizeFonts();
        timeline.setSize(win.width(), '300px');
        var width = win.width()/4.5;
        var imgSize = {
            width : width,
            height : width*0.7
        };
        $('#gallery_plate').css('width', width);
        $('#gallery').css(imgSize);
        $('.orbit-wrapper').css(imgSize);
        $('img.context').css(imgSize);
        $('#gallery_info').css('max-width', imgSize.width);
    });

    new Request({
        url : 'career.json',
        method: 'get',
        onSuccess : function(text){
            var data = JSON.parse(text);
            var min;
            var max;
            data.forEach(function(item, index){
                Object.keys(item).forEach(function(key){
                    var matches = item[key].match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
                    if(matches) data[index][key] = new Date(matches[3], matches[1], matches[2], matches[4], matches[5], matches[6]);
                    if(item[key] == '{{now}}') data[index][key] = new Date();
                    if(data[index][key] < min || !min) min = data[index][key];
                    if(data[index][key] > max || !max) max = data[index][key];
                });
            });
            window.career = data;
            timeline.draw(data, {
                'width':  '100%',
                'height': '300px',
                'editable': false,
                'style': 'box',
                min : min,
                max : max,
                onSelect : function(text, element){
                    var text = $('.timeline-event-content', $(element)).html();
                    showCard(text.toLowerCase().replace(/ /g, '_'));
                    window.career.forEach(function(job){
                        if(job.content == text) window.selectedCard = job;
                    });
                    $('.timeline-event').removeClass('selected');
                    $(timelineEventForName(text)).parent().addClass('selected');
                }
            });
        },
        onError : function(error){
            console.log('E!!', error);
        }
    }).send();
    $('#copy').html('&copy; '+(new Date()).getFullYear()+' Abbey Hawk Sparrow');
    $('.splash').css('height', $(window).height());

    new Keyboard({
        defaultEventType: 'keyup',
        events: {
            'left': lastCard,
            'right': nextCard,
            //'up': lastCard,
            //'down': nextCard,
            'esc': resetCards
        }
    }).activate();
});
