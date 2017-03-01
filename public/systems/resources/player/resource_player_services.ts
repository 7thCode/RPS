/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let ResourcePlayerServices: angular.IModule = angular.module('ResourcePlayerServices', []);

ResourcePlayerServices.factory('ResourceCreate', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/resources/api/create', {}, {});
    }]);

ResourcePlayerServices.factory('Resource', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/resources/api/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

ResourcePlayerServices.factory('ResourceQuery', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource("/resources/api/query/:query/:option", {query: '@query', option: '@optopn'}, {
            query: {method: 'GET'}
        });
    }]);

ResourcePlayerServices.factory('ResourceCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/resources/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);


ResourcePlayerServices.service('ResourcePlayerService', ["HtmlEdit", "ResourceCreate", "Resource", "ResourceQuery", "ResourceCount",
    function (HtmlEdit: any, ResourceCreate: any, Resource: any, ResourceQuery: any, ResourceCount: any): void {

        this.$scope = null;
        this.$compile = null;

        let change_watchers = [];
        let click_watchers = [];

        let init = () => {

            this.pagesize = 10;
            this.query = {};
            this.option = {limit: this.pagesize, skip: 0};

            this.current_page = null;
            this.current_id = null;

            this.edit_mode = false;

            change_watchers = [];
            click_watchers = [];

        };

        let click_handler = (id: string): string => {
            return 'edit($event,"' + id + '");';
        };

        let flatten_style = (a: any): string => {
            let result: string = "";
            _.forEach(a, (v: any, k: any): void => {
                result += k + ":" + v + ";";
            });
            return result;
        };

        let flatten_collection = (a: any, b: any): any => {
            _.forEach(b, (v: any, k: any): void => {
                if (k == "style") {
                    a[k] = flatten_style(v);
                } else {
                    a[k] = v;
                }
            });
            return a;
        };

        let watchChange = ($scope: any, id: string, events: any): void => {
            if (events) {
                if (events.onChange) {
                    change_watchers.push($scope.$watch(id, (value: string): void => {
                            let _scope = {id: id, $scope: $scope, value: value};
                            try {
                                new Function("_scope", "with (_scope) {" + events.onChange + "}")(_scope);//scope chainをぶった切る(for Security)
                            } catch (e) {

                            }
                        })
                    );
                }
            }
        };

        let watchChangeClear = (): void => {
            _.forEach(change_watchers, (change_watcher) => {
                change_watcher();
            });
        };

        let watchClick = ($scope: any, id: string, events: any): void => {
            if (events) {
                if (events.onClick) {
                    $scope["click_" + id] = () => {
                        click_watchers.push(id);
                        let _scope = {id: id, $scope: $scope};
                        try {
                            new Function("_scope", "with (_scope) {" + events.onClick + "}")(_scope);//scope chainをぶった切る(for Security)
                        } catch (e) {

                        }
                    };
                }
            }
        };

        let watchClickClear = (): void => {
            _.forEach(click_watchers, (click_watch_id) => {
                this.$scope["click_" + click_watch_id] = null;
            });
        };

        let Elements = (page, callback: (control, element) => boolean): void => {
            let _continue = true;
            _.forEach(page, (control: any): boolean => {
                _.forEach(control.elements, (element: any): boolean => {
                    _continue = callback(control, element);
                    return _continue;
                });
                return _continue;
            });
        };

        let attributes_by_mode = (editmode: boolean, element: any): any => {
            let result = {};
            if (this.edit_mode) {
                if (!element.attributes) {
                    element.attributes = {};
                } else {
                    if (element.attributes.style) {
                        //       element.attributes.style['cursor'] = 'crosshair';
                    }
                }
                result = flatten_collection(element.attributes, {'ng-click': click_handler(element.id)});
            } else {
                if (element.attributes) {
                    if (element.attributes['ng-click']) {
                        delete element.attributes['ng-click'];
                    }
                    if (element.attributes.style) {
                        delete element.attributes.style['cursor'];
                    }
                    result = element.attributes;
                }
            }

            return result;
        };

        let Deselect = (callback: (selected) => void): void => {
            this.selected = null;
            callback(null);
        };

        this.Select = (id, select: (selected) => void, deselect: (selected) => void): void => {
            Elements(this.current_page, (control, element): boolean => {
                let _continue = true;
                if (element) {
                    if (element.editable) {
                        if (element.id == id) {
                            Deselect(deselect);
                            this.selected = element;
                            select(element);
                            _continue = false;
                        }
                    }
                }
                return _continue;
            });
        };

        this.Selected = (): any => {
            return this.selected;
        };

        this.UpElement = (): void => {
            if (this.selected) {
                Elements(this.current_page, (target, element) => {
                    let _continue = true;
                    if (element.editable) {
                        if (element.id == this.selected.id) {
                            let index = 0;
                            _.forEach(this.current_page, (control) => {
                                if (control == target) {
                                    if (index > 1) {
                                        let t = this.current_page[index - 1];
                                        this.current_page[index - 1] = this.current_page[index];
                                        this.current_page[index] = t;
                                        _continue = false;
                                    }
                                }
                                index++;
                                return _continue;
                            });
                        }
                    }
                    return _continue;
                });
                this.Draw();
            }
        };

        this.DownElement = (): void => {
            if (this.selected) {
                Elements(this.current_page, (target, element) => {
                    let _continue = true;
                    if (element.editable) {
                        if (element.id == this.selected.id) {
                            let index = 0;
                            _.forEach(this.current_page, (control) => {
                                let result = true;
                                if (control == target) {
                                    if (index < this.current_page.length - 1) {
                                        let t = this.current_page[index + 1];
                                        this.current_page[index + 1] = this.current_page[index];
                                        this.current_page[index] = t;
                                        _continue = false;
                                    }
                                }
                                index++;
                                return _continue;
                            });
                        }
                    }
                    return _continue;
                });
                this.Draw();
            }
        };

        this.AddElement = (control): void => {
            if (this.edit_mode) {
                this.current_page.push(control);
                this.Draw();
            }
        };

        this.DeleteElement = (): void => {
            if (this.selected) {
                Elements(this.current_page, (target, element) => {
                    let _continue = true;
                    if (element.editable) {
                        if (element.id == this.selected.id) {
                            this.current_page = _.filter(this.current_page, (control) => {
                                return (target != control);
                            });
                            _continue = false;
                        }
                    }
                    return _continue;
                });
                this.Draw();
            }
        };

        this.ChildCount = (id: string): number => {
            return angular.element("#" + id).children().length;
        };

        this.ParentId = (_default: string): string => {
            let parent = this.Selected();
            let result = _default;
            if (parent) {
                result = parent.id;
            }
            return result;
        };

        this.CreateId = (_default_root: string): string => {
            let parent_id = this.ParentId(_default_root);
            let num = this.ChildCount(parent_id);
            return parent_id + "_" + num;
        };

        this.Draw = (callback: (element) => void): void => {

            watchChangeClear();
            watchClickClear();

            angular.element("#root").empty();
            this.$compile(angular.element("#root").contents())(this.$scope);

            Elements(this.current_page, (control, shape) => {
                let field: any[] = [];
                let id = shape.id;
                let parent = shape.parent;
                let label = shape.label;
                let type = shape.type;

                let attributes = attributes_by_mode(this.edit_mode, shape);
                let contents = shape.contents;
                let events = shape.events;
                switch (type) {
                    case "form":
                    case "div":
                    case "span":
                    case "label":
                    case "input":
                    case "textarea":
                    case "img":
                        field = [{
                            "name": type, "type": "element",
                            "_$": flatten_collection({"id": id}, attributes),
                            "@": contents
                        }];

                        if (!this.edit_mode) {
                            watchChange(this.$scope, id, events);
                        }
                        break;
                    case "select":// for bootstrap 3
                        let contents_model_name = id + "_contents";
                        this.$scope[contents_model_name] = contents;

                        field = [{
                            "name": "div", "type": "element",
                            "_$": {"class": "form-group"},
                            "@": [
                                {
                                    "name": "label", "type": "element",
                                    "_$": {"for": id},
                                    "@": label,
                                },
                                {
                                    "name": "select", "type": "element",
                                    "_$": flatten_collection({
                                        id: id,
                                        "class": "form-control",
                                        "ng-init": id + " = " + contents_model_name + "[0]",
                                        "ng-model": id,
                                        "ng-options": "option for option in " + contents_model_name,
                                        "name": id
                                    }, attributes)
                                }]
                        }];

                        if (!this.edit_mode) {
                            watchChange(this.$scope, id, events);
                        }
                        break;
                    case "button":// for bootstrap 3
                        field = [
                            {
                                "name": "button", "type": "element",
                                "_$": flatten_collection({
                                    id: id,
                                    class: "form-control",
                                    "ng-click": "click_" + id + "()"
                                }, attributes),
                                "@": label
                            }
                        ];

                        if (!this.edit_mode) {
                            watchClick(this.$scope, id, events);
                            watchChange(this.$scope, id, events);
                        }
                        break;
                    default:
                        field = [{
                            "name": type, "type": "element",
                            "_$": flatten_collection({"id": id}, attributes),
                            "@": contents
                        }];

                        if (!this.edit_mode) {
                            watchChange(this.$scope, id, events);
                        }
                        break;
                }

                let hoge = HtmlEdit.toHtml(field, "");

                let angular_element = angular.element(HtmlEdit.toHtml(field, ""));
                angular.element("#" + parent).append(angular_element);

                return true;
            });
            this.$compile(angular.element("#root").contents())(this.$scope);
        };

        this.SetEditMode = (mode: boolean, callback: (selected: any) => void): void => {
            Deselect(callback);
            this.edit_mode = mode;
            this.Draw();
        };

        this.Query = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
            ResourceQuery.query({
                query: encodeURIComponent(JSON.stringify(this.query)),
                option: encodeURIComponent(JSON.stringify(this.option))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Count = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            ResourceCount.get({
                query: encodeURIComponent(JSON.stringify(this.query))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Over = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Count((count) => {
                callback((this.option.skip + this.pagesize) < count);
            }, error);
        };

        this.Under = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            callback(this.option.skip >= this.pagesize);
        };

        this.Next = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Over((hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.pagesize;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Prev = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Under((hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.pagesize;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Create = (name: string, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            let form = new ResourceCreate();
            form.name = name;
            form.content = content;
            form.$save({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        this.current_id = result.value._id;
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Get = (id: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            this.current_id = id;
            Resource.get({
                id: this.current_id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Put = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let form = new Resource();
            form.content = content;
            form.$put({
                id: this.current_id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Delete = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            Resource.delete({
                id: this.current_id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        init();
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        init();

    }]);