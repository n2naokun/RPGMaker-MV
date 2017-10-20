//=============================================================================
// MenuJobBackground.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/10/20 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc ジョブごとにメニュー背景の画像を変更します。
 * ※シングルアクター環境専用プラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help ジョブのメモ欄で指定した背景画像をメニューの背景に表示します。
 * 指定の方法
 * <JobPic:画像ファイル名>
 * 
 * 画像格納フォルダ
 * /img/jobpicture/
 * 
 * ※シングルアクター環境を想定して作っているためその他の環境では想定通りの
 * 動作をしない可能性が極めて高いのでご注意ください。
 * 
 * YEP_ClassChangeCoreを併用する場合は本プラグインよりも先に読み込んでください。
 * ※クラスチェンジ画面の背景にも現在のクラスの画像が表示されます。
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function (_global) {
    // バックグラウンド画像用の処理を追加
    Scene_MenuBase_creageBackground = Scene_MenuBase.prototype.createBackground;
    Scene_MenuBase.prototype.createBackground = function () {
        Scene_MenuBase_creageBackground.call(this);

        // バックグラウンド用レイヤーを準備
        this._jobBackgroundSprite = new Sprite();
        this.addChild(this._jobBackgroundSprite);
    }

    // ジョブが変わった時の呼ばれる関数
    Scene_MenuBase.prototype.updateJobpic = function () {
        actor = this.actor();
        dataClass = $dataClasses[actor._classId];
        if (dataClass.meta.JobPic) {
            this._jobBackgroundSprite.bitmap = ImageManager.loadJobPic(String(dataClass.meta.JobPic));
        } else {
            this._jobBackgroundSprite.bitmap = null;
        }
    }

    // メニューが開かれるときに背景を変更する処理を追加
    Scene_MenuBase_updateActor = Scene_MenuBase.prototype.updateActor;
    Scene_MenuBase.prototype.updateActor = function () {
        Scene_MenuBase_updateActor.call(this);
        if (this._classPicture) {
            this.updateJobpic();
        }
    };

    // メニュー画面に入った時に背景を描画するための処理を追加
    Scene_Menu_initialize = Scene_Menu.prototype.initialize;
    Scene_Menu.prototype.initialize = function () {
        Scene_Menu_initialize.call(this);
        this._classPicture = true;
    };

    // YEP_ClassChangeCoreが読み込まれている場合の処理
    if (Imported.YEP_ClassChangeCore) {
        // ジョブチェンジ画面に入った時に背景を描画するための処理を追加
        Scene_Class_initialize = Scene_Class.prototype.initialize;
        Scene_Class.prototype.initialize = function () {
            Scene_Class_initialize.call(this);
            this._classPicture = true;
        };

        // ジョブが変更された場合背景を変更する処理を追加
        Scene_Class_onItemOk = Scene_Class.prototype.onItemOk;
        Scene_Class.prototype.onItemOk = function () {
            Scene_Class_onItemOk.call(this);
            this.updateJobpic();
        }
    }

})(this);

// ジョブ背景を読み込むための関数を用意
ImageManager.loadJobPic = function (filename, hue) {
    return this.loadBitmap('img/jobpicture/', filename, hue, true);
};