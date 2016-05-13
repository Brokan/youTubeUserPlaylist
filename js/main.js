var appList = angular.module("myYoutubeListApp", []); 

appList.controller("itemsListCtrl", function($scope, $http) {
    $scope.showList = true;
    //At first will get all videos
    $scope.getAllVideoList = function(nextPageToken) {
        //Get video page by page
        var url = config.listURL.replace("{max}", config.countOnRequest).replace("{pageToken}", nextPageToken);
        $http.get(url).then(function (response) {
            $scope.videoItems = [];
            //Check for not null items
            if (!response.hasOwnProperty("data") || !response.data.hasOwnProperty("items")) {
                var pagesScope = angular.element(document.getElementById("pagesWrap")).scope();
                pagesScope.prepareCountOfPages();
                $scope.showVideoForPage(config.currentPage);
                return;
            }
            //Set total count
            config.totalCount = response.data.pageInfo.totalResults;
            //Parse items to simple format
            var i, item;
            for (i in response.data.items) {
                item = response.data.items[i];
                config.videoItems.push({
                    id : config.videoItems.length,
                    title : item.snippet.title,
                    description : item.snippet.description,
                    publishedAt : item.snippet.publishedAt,
                    img : item.snippet.thumbnails.high.url,
                    video_id: item.contentDetails.videoId
                });
            }
            //Check for next page of videos
            if (response.data.hasOwnProperty("nextPageToken")) {
                $scope.getAllVideoList(response.data.nextPageToken);
                return;
            }
            //No next page, start show videos
            var pagesScope = angular.element(document.getElementById("pagesWrap")).scope();
                pagesScope.prepareCountOfPages();
            $scope.showVideoForPage(config.currentPage);
        });
    };
    $scope.getAllVideoList("");
    //Show videos of pages
    $scope.showVideoForPage = function(page) {
        $scope.videoItems = [];
        //Start push items to scope.videoItems
        var max = config.countOnPage
            , i = max*(page - 1)
            , item;
        max += i;
        for (; i < max; i++) {
            //Check for video existence
            if (config.videoItems.hasOwnProperty(i)) {
                item = config.videoItems[i];
                $scope.videoItems.push(item);
            }
        }
    };
    $scope.showSingleVideo = function($event) {
        //Get video index
        var index = ($event.currentTarget).dataset.index;
        //Check for video
        if (config.videoItems.hasOwnProperty(index)) {
            //Call function to show page videos
            var pagesScope = angular.element(document.getElementById("itemSingleWrap")).scope();
                pagesScope.showVideo(config.videoItems[index]);
        }
    };
});
appList.controller("pagesCtrl", function($scope) {
    $scope.currentPage = config.currentPage;
    $scope.showPages = true;
    //Preparing count of page
    $scope.prepareCountOfPages = function() {
        $scope.pagesCount = [];
        var pageCount = Math.ceil(config.totalCount / config.countOnPage),
            p;
        for (p = 1; p <= pageCount; p++){
            $scope.pagesCount.push(p);
        }
    };
    //Click on page
    $scope.toPage = function($event) {
        //Get clicked page
        config.currentPage = $scope.currentPage = ($event.currentTarget).dataset.page;
        //Call function to show page videos
        var pagesScope = angular.element(document.getElementById("itemsListWrap")).scope();
            pagesScope.showVideoForPage(config.currentPage);
    };
});
appList.controller("itemSingleCtrl", function($scope, $sce) {
    $scope.showSingle = false;
    var videoScope = angular.element(document.getElementById("itemsListWrap")).scope(),
        pagesScope = angular.element(document.getElementById("pagesWrap")).scope();
    
    $scope.showVideo = function(video) {
        videoScope.showList = pagesScope.showPages = false;
        $scope.showSingle = true;
        $scope.videoSingle = video;
        var publishedAt = new Date(video.publishedAt);
        $scope.publishTime = config.monthNames[publishedAt.getMonth()] + " " + publishedAt.getDate() + ", " + publishedAt.getFullYear();
        $scope.videoURL = "https://www.youtube.com/embed/"+video.video_id;
        $scope.videoURLiFrame = $sce.trustAsHtml('<iframe src="'+$scope.videoURL+'" frameborder="0" allowfullscreen></iframe>');
    };
    $scope.toList = function() {
        $scope.showSingle = false;
        videoScope.showList = pagesScope.showPages = true;
        videoScope.showVideoForPage(config.currentPage);
        
    };
});