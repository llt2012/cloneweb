
$(document).ready(function () {
    dataURL = ""

    $("#sendLink").on("click", function () {
        data = $("#linkid").val()

        axios.get("/live?id=" + data).then(function (res) {
            dataURL = res
            // var overrideNative = false;
            // var xhr = new XMLHttpRequest();
            // // xhr.responseType = 'blob'; //so you can access the response like a normal URL
            // // xhr.onreadystatechange = function () {
            // //     if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            // //         video.src = URL.createObjectURL(xhr.response);
            // //         //create <img> with src set to the blob
            // //     }
            // // };
            // // xhr.open('GET', dataURL.data.link, true);
            // // xhr.setRequestHeader("Accept-Language", dataURL.data.lg);
            // // xhr.send();
            // xhr.onreadystatechange = function () {
            //     video.src = xhr.response
            //     video.addEventListener('loadedmetadata', function () {
            //         video.play();
            //     });
            // }
            // xhr.open('GET', dataURL.data.link, true);
            // xhr.setRequestHeader("Accept-Language", dataURL.data.lg);
            // xhr.send()
            // fetch("https://delivery225.akamai-cdn-content.com/hls2/01/04206/yg7q3l6bc0ih_l/seg-1-a1.ts?t=_5ojFheHgDmKR6cLmb1XBqzyQU41072V8C0CHfb8OQc&s=1648208058&e=21600&f=21033297&srv=sto058&client=114.161.124.207",{method:"GET",headers:{"Accept-Language":dataURL.data.lg}}).then(result => result.blob()).then(blob=>{
            //     var blobURL = URL.createObjectURL(blob);
            //     video.src = blobURL
            //     video.addEventListener('loadedmetadata', function () {
            //         video.play();
            //     });
            // })
            if(!dataURL.data.error){
                if (Hls.isSupported()) {

                    tmp = dataURL.data.link
                    var hls = new Hls({
                        xhrSetup: function (xhr,url) {
    
                        }
                    });
                    hls.loadSource(dataURL.data.link)
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.muted = true;
                        video.play();
                    })
                } else if (video.canPlayType('application/vnd.apple.mpegurl', "application/x-mpegURL")) {
                    //var xhr = new XMLHttpRequest();
                    // xhr.responseType = 'blob'; //so you can access the response like a normal URL
                    // xhr.onreadystatechange = function () {
                    //     if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    //         video.src = URL.createObjectURL(xhr.response);
                    //         //create <img> with src set to the blob
                    //     }
                    // };
                    // xhr.open('GET', dataURL.data.link, true);
                    // xhr.setRequestHeader("Accept-Language", dataURL.data.lg);
                    // xhr.send();
                    video.src = dataURL.data.link
                    video.addEventListener('loadedmetadata', function () {
                        video.play();
                    });
                }
            }else
            {
                alert(dataURL.data.error)
            }
        })
    })

    function request_xhr(url, header, cb) {
        var xhr = new XMLHttpRequest;
        xhr.open('get', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.setRequestHeader("Accept-Language", header)
        xhr.onload = function () {
            cb(xhr.response);
        };
        xhr.send();
    }


    $(".section-course").on("click", function () {

        // data = $(this).text()
        // axios.get("/course/" + data).then(function (res) {
        //     $(".getlink").prop("href", res.data.link)
        //     var video = document.getElementById("video");
        //     if (Hls.isSupported()) {
        //         var hls = new Hls({
        //             xhrSetup: xhr => {
        //                 xhr.setRequestHeader("Host", "delivery156.akamai-cdn-content.com")
        //                 xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36")
        //                 xhr.setRequestHeader("Accept", "*/*")
        //                 xhr.setRequestHeader("Origin", "https://streamsb.net")
        //                 xhr.setRequestHeader("Sec-Fetch-Site", "cross-site")
        //                 xhr.setRequestHeader("Sec-Fetch-Mode", "cors")
        //                 xhr.setRequestHeader("Accept-Encoding", "gzip, deflate, br")
        //                 xhr.setRequestHeader("Accept-Language", dataURL.data.lg)
        //             }
        //         });
        //         hls.loadSource(dataURL)
        //         hls.attachMedia(video);
        //         hls.on(Hls.Events.MANIFEST_PARSED, function () {
        //             video.muted = true;
        //             video.play();
        //         })
        //     } else if (video.canPlayType('application/vnd.apple.mpegurl', "application/x-mpegURL")) {
        //         video.src = res.data.data;
        //         video.addEventListener('loadedmetadata', function () {
        //             video.play();
        //         });
        //     }
        // }).catch(function (error) {
        //     // handle error
        //     console.log(error);
        // })
    })
    // function geturl(data){
    //     const dataUrl = data


    function toggleCRC(thisChevron, thisID, thisHead) {
        if ($(thisChevron).hasClass("on")) {
            $(thisChevron).removeClass("on");
            $(thisChevron).css("transform", "rotate(0deg)");
        } else {

            $(thisChevron).addClass("on");
            $(thisChevron).css("transform", "rotate(180deg)");
        }
        $("#" + thisID).slideToggle(600, "swing", function () {
        });
    }

    /* open accordian */
    $(".acc-head").click(function () {

        var expandThisID = $(this).data("section");
        var thisHead = $('.acc-head[data-section=' + expandThisID + ']');
        var chevron = $('i[data-section=' + expandThisID + ']');
        // close open chevrons
        $(".crc-chevron").each(function () {
            if ($(this).hasClass("on")) {
            }
        })
        // close open accordions

        $(".acc-body").each(function () {
            if ($(this).data("section") != expandThisID && $(this).is(":visible")) {
                $("#" + $(this).data("section")).slideToggle(600, "swing", function () {
                });
                $("i[data-section=" + $(this).data("section") + ']').removeClass("on");
                $("i[data-section=" + $(this).data("section") + ']').css("transform", "rotate(0deg)");
            }
        });

        $("#" + expandThisID + " button").removeClass("crc-close-anim");

        toggleCRC(chevron, expandThisID, thisHead);
    });

    /* X functionality */
    $('.close').click(function () { // fa-times class
        $(this).addClass("crc-close-anim");
        var collapseThisID = $(this).data("section");
        //console.log(collapseThisID);
        var chevron = $('i[data-section=' + collapseThisID + ']');
        var thisHead = $('.acc-head[data-section=' + collapseThisID + ']');
        toggleCRC(chevron, collapseThisID, thisHead)
    });
})
