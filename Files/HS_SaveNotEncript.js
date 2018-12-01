//=============================================================================
// HS_SaveNotEncript.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2018/12/02 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc セーブデータ非暗号化プラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help このプラグインが有効化されている間はセーブデータが
 * 暗号化されず生のJSON形式で保存されます。
 * 中身を見たり編集したりする場合はJSONの整形機能がある
 * エディタを使うことを強く推奨します。
 *
 * ※初期から導入されていない場合導入以前のセーブデータは読み込めません。
 *   また、ブラウザでプレイしている場合は導入前と同じ動作をします。
 *
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

// ESLint向けグローバル変数宣言
/*global */

"use strict"; //厳格なエラーチェック

var Imported = Imported || {};
Imported.HS_SaveNotEncript = true;
// 他のプラグインとの連携用シンボル

(function(_global) {
   var LZString_decompressFromBase64 = LZString.decompressFromBase64;
   LZString.decompressFromBase64 = function(data) {
      if (Utils.isNwjs()) {
         return data;
      } else {
         return LZString_decompressFromBase64.call(this, data);
      }
   };

   var LZString_compressToBase64 = LZString.compressToBase64;
   LZString.compressToBase64 = function(json) {
      if (Utils.isNwjs()) {
         return json;
      } else {
         return LZString_compressToBase64.call(this, json);
      }
   };

   var StorageManager_localFilePath = StorageManager.localFilePath;
   StorageManager.localFilePath = function(savefileId) {
      if (Utils.isNwjs()) {
         var name;
         if (savefileId < 0) {
            name = "config.json";
         } else if (savefileId === 0) {
            name = "global.json";
         } else {
            name = "file%1.json".format(savefileId);
         }
         return this.localFileDirectoryPath() + name;
      } else {
         return StorageManager_localFilePath.call(this, savefileId);
      }
   };
})(this);
