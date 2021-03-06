﻿
var BABYLON;
(function (BABYLON) {
    // We're mainly based on the logic defined into the FreeCamera code
    var FilesInput = (function () {
        /// Register to core BabylonJS object: engine, scene, rendering canvas, callback function when the scene will be loaded,
        /// loading progress callback and optionnal addionnal logic to call in the rendering loop
        function FilesInput(p_engine, p_scene, p_canvas, p_sceneLoadedCallback, p_progressCallback, p_additionnalRenderLoopLogicCallback, p_textureLoadingCallback, p_startingProcessingFilesCallback) {
            this.engine = p_engine;
            this.canvas = p_canvas;
            this.currentScene = p_scene;
            this.sceneLoadedCallback = p_sceneLoadedCallback;
            this.progressCallback = p_progressCallback;
            this.additionnalRenderLoopLogicCallback = p_additionnalRenderLoopLogicCallback;
            this.textureLoadingCallback = p_textureLoadingCallback;
            this.startingProcessingFilesCallback = p_startingProcessingFilesCallback;
        }
        FilesInput.prototype.monitorElementForDragNDrop = function (p_elementToMonitor) {
            var _this = this;
            if (p_elementToMonitor) {
                this.elementToMonitor = p_elementToMonitor;
                this.elementToMonitor.addEventListener("dragenter", function (e) {
                    _this.drag(e);
                }, false);
                this.elementToMonitor.addEventListener("dragover", function (e) {
                    _this.drag(e);
                }, false);
                this.elementToMonitor.addEventListener("drop", function (e) {
                    _this.drop(e);
                }, false);
            }
        };

        FilesInput.prototype.renderFunction = function () {
            if (this.additionnalRenderLoopLogicCallback) {
                this.additionnalRenderLoopLogicCallback();
            }

            if (this.currentScene) {
                if (this.textureLoadingCallback) {
                    var remaining = this.currentScene.getWaitingItemsCount();

                    if (remaining > 0) {
                        this.textureLoadingCallback(remaining);
                    }
                }
                this.currentScene.render();
            }
        };

        FilesInput.prototype.drag = function (e) {
            e.stopPropagation();
            e.preventDefault();
        };

        FilesInput.prototype.drop = function (eventDrop) {
            eventDrop.stopPropagation();
            eventDrop.preventDefault();

            this.loadFiles(eventDrop);
        };

        FilesInput.prototype.loadFiles = function (event) {
            var that = this;
            if (this.startingProcessingFilesCallback)
                this.startingProcessingFilesCallback();

            var sceneFileToLoad;
            var filesToLoad;

            // Handling data transfer via drag'n'drop
            if (event && event.dataTransfer && event.dataTransfer.files) {
                filesToLoad = event.dataTransfer.files;
            }

            // Handling files from input files
            if (event && event.target && event.target.files) {
                filesToLoad = event.target.files;
            }

            if (filesToLoad && filesToLoad.length > 0) {
                for (var i = 0; i < filesToLoad.length; i++) {
                    if (filesToLoad[i].name.indexOf(".babylon") !== -1 && filesToLoad[i].name.indexOf(".manifest") === -1 && filesToLoad[i].name.indexOf(".incremental") === -1 && filesToLoad[i].name.indexOf(".babylonmeshdata") === -1 && filesToLoad[i].name.indexOf(".babylongeometrydata") === -1) {
                        sceneFileToLoad = filesToLoad[i];
                    } else {
                        if (filesToLoad[i].type.indexOf("image/jpeg") == 0 || filesToLoad[i].type.indexOf("image/png") == 0) {
                            BABYLON.FilesInput.FilesTextures[filesToLoad[i].name] = filesToLoad[i];
                        }
                    }
                }

                // If a ".babylon" file has been provided
                if (sceneFileToLoad) {
                    if (this.currentScene) {
                        this.engine.stopRenderLoop();
                        this.currentScene.dispose();
                    }

                    BABYLON.SceneLoader.Load("file:", sceneFileToLoad, this.engine, function (newScene) {
                        that.currentScene = newScene;

                        // Wait for textures and shaders to be ready
                        that.currentScene.executeWhenReady(function () {
                            // Attach camera to canvas inputs
                            if (that.currentScene.activeCamera) {
                                that.currentScene.activeCamera.attachControl(that.canvas);
                            }
                            if (that.sceneLoadedCallback) {
                                that.sceneLoadedCallback(sceneFileToLoad, that.currentScene);
                            }
                            that.engine.runRenderLoop(function () {
                                that.renderFunction();
                            });
                        });
                    }, function (progress) {
                        if (that.progressCallback) {
                            that.progressCallback(progress);
                        }
                    });
                } else {
                    BABYLON.Tools.Error("Please provide a valid .babylon file.");
                }
            }
        };
        FilesInput.FilesTextures = new Array();
        return FilesInput;
    })();
    BABYLON.FilesInput = FilesInput;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=babylon.filesInput.js.map
