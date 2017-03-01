/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ArticlePageRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const services_config = share.services_config;
    const webfonts:any[] = services_config.webfonts;

    const ArticleModule: any = require(share.Server("services/articles/controllers/article_controller"));
    const article: any = new ArticleModule.Article;

    const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis: any = new AnalysisModule.Analysis;

    const dialog_message = {long: "too long", short: "Too Short", required: "Required"};

    router.get("/", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("services/articles/index", {user: request.user, message: "Articles", status: 200, fonts:webfonts});
    }]);

    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/articles/dialogs/create_dialog", {messages: dialog_message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/articles/dialogs/delete_confirm_dialog", {messages: dialog_message});
    }]);

    // localhost:8000/articles/render/000000000000000000000000/test1/あ
    router.get("/form/:userid/:page_name/:article_name", [exception.page_catch,analysis.page_view, (request: any, response: any): void => {
        article.render_form(request.params.userid, request.params.page_name, request.params.article_name, (error: any, result: string): void => {
            if (!error) {
                response.render("services/forms/render", {html: result, fonts:webfonts});
            } else {
                switch (error.code) {
                    case 10000:
                        response.status(404).render('error', {status: 404, message: "page not found...", url: request.url});
                        break;
                    case 20000:
                        response.status(404).render('error', {status: 404, message: "article not found...", url: request.url});
                        break;
                    default:
                        response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                }
            }
        });
    }]);

    // localhost:8000/articles/resource/000000000000000000000000/test1/あ
    router.get("/resource/:userid/:page_name/:article_name", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        article.render_resource(request.params.userid, request.params.page_name, request.params.article_name, (error: any, result: any): void => {
            if (!error) {
                response.send(result.resource);
            } else {
                switch (error.code) {
                    case 10000:
                        response.status(404).render('error', {status: 404, message: "page not found...", url: request.url});
                        break;
                    case 20000:
                        response.status(404).render('error', {status: 404, message: "article not found...", url: request.url});
                        break;
                    default:
                        response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                }
            }
        });
    }]);

    // localhost:8000/articles/resources/000000000000000000000000/test1&q={}&o={}
    router.get("/resources/:userid/:page_name", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        article.render_resources(request.params.userid, request.params.page_name, request.query, (error: any, result: any): void => {
            if (!error) {
                response.send(result.resource);
            } else {
                switch (error.code) {
                    case 10000:
                        response.status(404).render('error', {status: 404, message: "page not found...", url: request.url});
                        break;
                    case 20000:
                        response.status(404).render('error', {status: 404, message: "article not found...", url: request.url});
                        break;
                    default:
                        response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                }
            }
        });
    }]);

}

module.exports = ArticlePageRouter.router;