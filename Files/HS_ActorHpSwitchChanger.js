//=============================================================================
// HS_ActorHpSwitchChanger.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2019/05/10 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc アクターのHPによってスイッチをON-OFFするプラグインです。
 * メモ欄に記述して使用します。（一応敵にも使用可能）
 * @author n2naokun(柊菜緒)
 * 
 * @help アクターやエネミーのメモ欄に記述して使用できます。
 * ※大文字と小文字を区別するので注意してください。
 * 書き方
 * <HP(演算子)(HPと比較する数字)(割合比較の場合%を入れる):(スイッチの番号)>
 * 演算子には
 * == <= >= < >
 * これらの比較演算子を使用できます。
 * 一つのアクターやエネミーに複数の記述をすることが可能です。
 * 同じスイッチを指定している場合最後に記述した物の結果のみが反映されます。
 * 
 * 例
 * <HP<20%:1>
 * HPが20%より小さくなると(20は含まない)スイッチ1がONになります。
 *
 * <HP>20%:1>
 * HPが20%より大きくなると(20は含まない)スイッチ1がONになります。
 *
 * <HP<=3000:50>
 * HPが3000以下になると(3000も含む)スイッチ50がONになります。
 *
 * <HP>=3000:50>
 * HPが3000以上になると(3000も含む)スイッチ50がONになります。
 *
 * <HP==100:22>
 * HPが100ピッタリになるとスイッチ22がONになります。
 * 
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

// ESLint向けグローバル変数宣言
/*global */

"use strict";//厳格なエラーチェック

var Imported = Imported || {};
Imported.HS_ActorHpSwitchChanger = true;
// 他のプラグインとの連携用シンボル

(function (_global) {
   let Game_Battler_gainHp = Game_Battler.prototype.gainHp;

   // パラメーターのキャッシュ
   let actorsSwitchParams = [];
   const paramCheck = /^<HP(==|<=|>=|<|>)(\d+)(%|)?:(\d+)>/;
   /*
   param構造
   [mode(Number), code(String), value(Number), switch(Number)]
   mode:
      数値として直接処理するか割合として処理するかの値
      0なら数値
      1なら割合
   code:
      比較するための演算子
      == <= >= < >
      から選択
   value:
      HPと比較する値
   switchId:
      比較して条件を満たしていたらONになるスイッチ番号
   */

   Game_Battler.prototype.gainHp = function (value) {
      Game_Battler_gainHp.apply(this, arguments);

      let hp = this.hp;
      const mhp = this.mhp;
      const actorId = this.actorId();

      // パラメーター解析部
      if (!actorsSwitchParams[actorId]) {
         paramsInit(actorId);
      }


      // スイッチ操作部
      actorsSwitchParams[actorId].forEach(function (param) {
         const mode = param.mode;
         const code = param.code;
         const value = param.value;
         const switchId = param.switchId;
         if (mode) { // 1 なら実行される
            hp = hp / mhp * 100;
         }
         let result = false;
         switch (code) {
            case "==":
               result = hp === value;
               break;
            case "<=":
               result = hp <= value;
               break;
            case ">=":
               result = hp >= value;
               break;
            case "<":
               result = hp < value;
               break;
            case ">":
               result = hp > value;
               break;
         }

         $gameSwitches.setValue(switchId, result);
      }.bind(this));

   };

   let paramsInit = function (actorId) {
      const note = $dataActors[actorId].note;
      let meta = note.split("\n");
      meta = meta.filter(function (elem) {
         return paramCheck.test(elem);
      }.bind(this));

      let params = [];
      meta.forEach(function (elem) {
         let param = {};
         let data = elem.match(paramCheck);
         // modeをセット
         if (data[3] === "%") {
            param.mode = 1;
         } else {
            param.mode = 0;
         }
         // codeをセット
         param.code = data[1];
         // valueをNumberにキャストしてセット
         param.value = Number(data[2]);
         // switchIdをNumberにキャストしてセット
         param.switchId = Number(data[4]);

         // paramsにパラメーターを追加
         params.push(param);
      });
      actorsSwitchParams[actorId] = params;
   };

   let DataManager_onload = DataManager.onLoad;
   DataManager.onLoad = function (object) {
      DataManager_onload.call(this, object);
      if (object === $dataActors) {
         $dataActors.forEach(function (actor, actorId, actors) {
            if (actor) {
               paramsInit(actorId);
            }
         });
      }
   };

})(this);