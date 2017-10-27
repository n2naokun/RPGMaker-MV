//=============================================================================
// JobCharacterImageChanger.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.1 2017/10/28 競合が発生する可能性のあるバグを修正
// 1.0.0 2017/10/25 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc ジョブを変更したら歩行画像を変更するプラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help 使い方
 * 職業のメモ欄で画像名と画像番号を指定してください。
 * <CharaImage:画像名>
 * <ImageNum:画像番号>
 * 
 * 画像番号
 * 0 1 2 3
 * 4 5 6 7
 * 
 * ※シングルアクター環境を想定して作っているためその他の環境では想定通りの
 * 動作をしない可能性が極めて高いのでご注意ください。
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

'use strict';//厳格なエラーチェック

(function (_global) {
    // クラスチェンジされると呼ばれる処理
    var Game_Actor_changeClass = Game_Actor.prototype.changeClass;
    Game_Actor.prototype.changeClass = function (classId, keepExp) {
        Game_Actor_changeClass.call(this, classId, keepExp);
        // クラスチェンジされたら歩行イラストを変更
        this.CharaImageChange();
    }

    // 歩行イラストを変更する処理
    Game_Actor.prototype.CharaImageChange = function () {
        var dataClass = $dataClasses[this._classId];

        if (dataClass.meta.CharaImage && dataClass.meta.ImageNum && !isNaN(Number(dataClass.meta.ImageNum))) {
            var CharaImage = String(dataClass.meta.CharaImage);
            var ImageNum = Number(dataClass.meta.ImageNum);

            this.setCharacterImage(CharaImage, ImageNum);
            $gamePlayer.refresh()
        }
    }

})(this);