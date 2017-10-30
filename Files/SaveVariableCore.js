//=============================================================================
// SaveVariableCore.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/10/29 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc プラグイン内の変数を簡単にセーブに対応させる前提プラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help セーブしたいオブジェクト = new saveObject(プラグインの名前の文字列);
 * 上記のようにプラグイン内でインスタンスを生成して通常通りに使ってください。
 * プレーヤーがセーブしたタイミングでセーブされます。
 * ※セーブごとに内容が変わるので注意。
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

'use strict';//厳格なエラーチェック

var Imported = Imported || {};
Imported.SaveVariableCore = true;

(function (_global) {
    // セーブ用のオブジェクトを作成
    window.$saveParams = {};

    var DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        DataManager_createGameObjects.call(this);
        $saveParams = $saveParams || new saveParams();
    }

    var DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        var contents = DataManager_makeSaveContents.call(this);
        contents.saveParams = $saveParams;
        return contents;
    };

    var DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        DataManager_extractSaveContents.call(this, contents);
        $saveParams = contents.saveParams;
    };

    function saveParams() { }
})(this);

// セーブオブジェクトの定義
function saveObject() {
    this.initialize.apply(this, arguments);
}

// セーブオブジェクトの初期化
saveObject.prototype.initialize = function (name) {
    if (name != null && name != "") {
        $saveParams[name] = this;
        // thisのインスタンスへの参照を渡さずに$saveParamsの参照を渡す
        return $saveParams[name];
    }
    else {
        throw "saveObject name null exception";
    }
}