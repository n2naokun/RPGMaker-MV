//=============================================================================
// HS_ActorHpSwitchChanger.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2019/05/10 初版
// 1.1.0 2019/05/11 パラメーターが評価されるタイミングを追加
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc アクターのHPによってスイッチをON-OFFするプラグインです。
 * アクターのメモ欄に記述して使用します。（敵への使用は未検証のため動作補償外）
 * @author n2naokun(柊菜緒)
 * 
 * @help アクターのメモ欄に記述して使用できます。
 * ※大文字と小文字を区別するので注意してください。
 * 
 * 書き方：
 * <HP(演算子)(HPと比較する数字)(割合比較の場合%を入れる):(スイッチの番号)>
 * 演算子には
 * == <= >= < >
 * これらの比較演算子を使用できます。
 * 一つのアクターに複数の記述をすることが可能です。
 * 同じスイッチを指定している場合最後に記述した物の結果のみが反映されます。
 * 
 * 例：
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
 * 動作タイミング：
 * アクターに設定したパラメーターが評価されるタイミングは以下です。
 * ・アクターのHPが増減したタイミング
 * ・ニューゲームをした直後
 * ・ゲームをロードした直後
 * ・バトルに入る直前
 * ・パーティーメンバーが増えた時
 * 
 * 注意：
 * バトルに参加しないパーティーメンバーのHPも評価されます。
 * アクターがパーティを抜ける時はアクターに関連するスイッチはすべてOFFになります。
 * 抜けたアクターが再びパーティに参加するとその時点で再評価されます。
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
   {mode:Number, code:String, value:Number, switch:Number}
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

      const actorId = this.actorId();
      // パラメーター解析部
      if (!actorsSwitchParams[actorId]) {
         paramInit(actorId);
      }

      // スイッチ操作部
      actorsSwitchParams[actorId].forEach(switcher.bind(this));

   };

   let switcher = function (param) {
      let hp = this.hp;
      const mhp = this.mhp;
      const mode = param.mode;
      const code = param.code;
      const value = param.value;
      const switchId = param.switchId;
      if (mode) { // 1 なら割合モードなので実行される
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
   };

   let paramInit = function (actorId) {
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
   // アクターデータ読み込み完了時にパラメーターを構築
   DataManager.onLoad = function (object) {
      DataManager_onload.apply(this, arguments);
      if (object === $dataActors) {
         $dataActors.forEach(function (actor, actorId, actors) {
            if (actor) {
               paramInit(actorId);
            }
         });
      }
   };

   // ニューゲーム時にパラメーターを評価
   let DataManager_setupNewGame = DataManager.setupNewGame;
   DataManager.setupNewGame = function () {
      DataManager_setupNewGame.call(this);
      $gameParty.allMembers().forEach(function (actor) {
         actorsSwitchParams[actor.actorId()].forEach(switcher.bind(actor));
      });
   };

   // ロード時にパラメーターを評価
   let DataManager_loadGame = DataManager.loadGame;
   DataManager.loadGame = function (savefileId) {
      const result = DataManager_loadGame.apply(this, arguments);
      $gameParty.allMembers().forEach(function (actor) {
         actorsSwitchParams[actor.actorId()].forEach(switcher.bind(actor));
      });
      return result;
   };

   // バトルに入る直前にパラメーターを評価
   let BattleManager_setup = BattleManager.setup;
   BattleManager.setup = function (troopId, canEscape, canLose) {
      $gameParty.allMembers().forEach(function (actor) {
         actorsSwitchParams[actor.actorId()].forEach(switcher.bind(actor));
      });
      BattleManager_setup.apply(this, arguments);
   };

   // パーティーメンバー追加時にパラメーターを評価
   let Game_Party_addActor = Game_Party.prototype.addActor;
   Game_Party.prototype.addActor = function (actorId) {
      if (!this._actors.contains(actorId)) {
         Game_Party_addActor.apply(this, arguments);
         this.allMembers().forEach(function (actor) {
            actorsSwitchParams[actor.actorId()].forEach(switcher.bind(actor));
         });
      }
   };

   // パーティーメンバー削除時に削除したメンバーに結び付けられたスイッチをOFFに
   let Game_Party_removeActor = Game_Party.prototype.removeActor;
   Game_Party.prototype.removeActor = function (actorId) {
      if (this._actors.contains(actorId)) {
         const actor = $gameActors.actor(actorId);
         actorsSwitchParams[actor.actorId()].forEach(function (param) {
            const switchId = param.switchId;
            $gameSwitches.setValue(switchId, false);
         });
      }
      Game_Party_removeActor.apply(this, arguments);
   };

})(this);