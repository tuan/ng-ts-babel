/// <reference path="./typings/tsd.d.ts" />

module TestApp {
    "use strict";
    
    let app = angular.module("app", []);
    app.directive("test", () => {
        return {
            scope: {},
            templateUrl: "test.html",
            controller: TestController,
            controllerAs: "controller"
        }
    });
    
    class TestController {
        public static $inject = ["$q"];
        
        public secret: string;
        
        constructor(private $q: ng.IQService, private $scope: ng.IScope) {
            this.secret = "constructor";
        }
        
        public async computeAsync() {
            this.secret = await this.internalComputeAsync("computeAsync"); 
        }
        
        public async computeAsyncAndDigest() {
            this.secret = await this.internalComputeAsync("computeAsyncAndDigest");
            this.$scope.$apply(); 
        }
        
        private internalComputeAsync(message: string): ng.IPromise<string> {
            let deferred = this.$q.defer();
            setTimeout(function() {
                deferred.resolve(message);
            }, 1000);
            
            return deferred.promise;
        }
         
        public compute() {
            this.secret = "compute";
        }
        
        public computeDelayed() {
            this.internalComputeAsync("computeDelayed").then((message: string) => {
                this.secret = message;
            })
            
        }
    }
}
