//=============================================================================
// AutoReviveItem.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.3 2017/12/19 バトル終了時リザルトが表示されない可能性があるバグを修正
// 1.0.2 2017/10/28 競合が発生する可能性のあるバグを修正
// 1.0.1 2017/10/25 一部プラグインパラメーターが上手く動作しないのを修正
// 1.0.0 2017/10/18 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc 特定のアイテムを持っていた場合死んでも蘇生するプラグイン
 * @author 柊菜緒(n2naokun)
 * 
 * @param RestoreHPtype
 * @type number
 * @min 0
 * @max 1
 * @desc 0の場合最大HPでの割合でHPを回復させます、1の場合指定された数値分HPを回復します。
 * @default 0
 * 
 * @param RestoreHPRatio
 * @type number
 * @min 0
 * @max 100
 * @desc 割合でHPを回復させる場合の割合を設定
 * @default 100
 * 
 * @param RestoreHPnum
 * @type number
 * @min 0
 * @desc 数値を指定してHPを回復させる場合の数値を設定
 * @default 100
 * 
 * @param RestoreMP
 * @type boolean
 * @desc MPを回復させるかの設定
 * @default true
 * 
 * @param RestoreMPtype
 * @type number
 * @min 0
 * @max 1
 * @desc 0の場合最大MPでの割合でMPを回復させます、1の場合指定された数値分MPを回復します。
 * @default 0

 * @param RestoreMPRatio
 * @type number
 * @min 0
 * @max 100
 * @desc 割合でMPを回復させる場合の割合を設定
 * @default 100

 * @param RestoreMPnum
 * @type number
 * @min 0
 * @desc 数値を指定してMPを回復させる場合の数値を設定
 * @default 100
 * 
 * @param MarkStateNotClear
 * @type boolean
 * @desc マークしておいたステートを死亡時に消さないかを設定
 * @default true
 * 
 * @param ExecuteCommonEvent
 * @type boolean
 * @desc 全滅からの回復時にコモンイベントを呼び出すかを設定
 * @default true
 * 
 * @param CallCommonEvent
 * @type number
 * @desc 全滅からの回復時に呼び出されるコモンイベントを設定します。
 * 
 * 
 * @help このプラグインにはプラグインコマンドはありません。
 * 
 * 敗北時にコモンイベントなどを発生させるタイプのプラグインと
 * 併用する場合出来るだけあとに読み込んでください。
 * 
 * エフェクトなどを表示したい場合はコモンイベントを使用してください。
 * 
 * 復活時にMPを回復する場合指定した数値が死亡時のMPよりも小さい場合は
 * 回復しません。
 * 
 * 持っていたら自動的に復活するアイテムのメモ欄に
 * <ReviveItem>
 * と記入してください。
 * 
 * また、回復時に消したくないステートのメモ欄には
 * <ReviveNotClear>
 * と記入してください。
 * 回復と同時にステートが付きます。
 * 
 * ※シングルアクター環境で動作をテストしているためその他の環境では未確認です。
 * ※ターン数で解除するタイプのステートではテストしていません。
 *   ターン数を引き継ぐ処理をしていないため未保証。
 */

"use strict";//厳格なエラーチェック

(function (_global) {
   function toBoolean(str) {
      if (str == "true") return true;
      return false;
   }

   var params = PluginManager.parameters("AutoReviveItem");
   var setting = {};
   setting.HPtype = Number(params["RestoreHPtype"]);
   setting.HPratio = Number(params["RestoreHPRatio"]);
   setting.HPnum = Number(params["RestoreHPnum"]);
   setting.RestoreMP = toBoolean(params["RestoreMP"]);
   setting.MPtype = Number(params["RestoreMPtype"]);
   setting.MPratio = Number(params["RestoreMPRatio"]);
   setting.MPnum = Number(params["RestoreMPnum"]);
   setting.MarkStateNotClear = toBoolean(params["MarkStateNotClear"]);
   setting.ExeCommonEvent = toBoolean(params["ExecuteCommonEvent"]);
   setting.CallEvent = Number(params["CallCommonEvent"]);

   var BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
   BattleManager.checkBattleEnd = function () {
      //全滅判定チェック
      if ($gameParty.isAllDead()) {//全滅なら実行
         //所持アイテムをチェック
         var dat = Utility.CheckReviveItem();
         if (dat.flag) {
            $gameParty.reviveItemUse(dat.item);
            return false;
         }
      }
      return BattleManager_checkBattleEnd.call(this);
   };

   var Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
   Game_BattlerBase.prototype.initMembers = function () {
      Game_BattlerBase_initMembers.call(this);
      this._remainStates = [];
   };

   var Game_BattlerBase_clearStates = Game_BattlerBase.prototype.clearStates;
   Game_BattlerBase.prototype.clearStates = function () {
      if (this._states != null) {
         var dat = Utility.CheckReviveItem();
         if (this._states.length != 0 && setting.MarkStateNotClear && dat.flag) {
            this._remainStates = [];
            this._states.forEach(function (statesId) {
               if (Utility.isMarkState(statesId)) {
                  this._remainStates.push(statesId);
               }
            }, this);
         }
      }
      Game_BattlerBase_clearStates.call(this);
   };

   Game_Party.prototype.reviveItemUse = function (item) {
      this.battleMembers().forEach(function (actor) {
         if (actor._hp === 0) {
            var HP;
            var MP = actor._mp;
            if (setting.HPtype === 0) {
               HP = actor.mhp * (setting.HPratio / 100);
            } else if (setting.HPtype === 1) {
               HP = setting.HPnum;
            }
            actor.setHp(HP);
            if (setting.RestoreMP) {
               if (setting.MPtype === 0) {
                  if (MP < actor.mmp * (setting.MPratio / 100)) {
                     MP = actor.mmp * (setting.MPratio / 100);
                  }
               } else if (setting.MPtype === 1) {
                  if (MP < setting.MPnum) {
                     MP = setting.MPnum;
                  }
               }
               actor.setMp(MP);
            }
            if (setting.MarkStateNotClear) {
               actor._remainStates.forEach(function (states) {
                  actor._states.push(states);
               }, this);
               actor._remainStates = [];
            } else {
               actor.clearStates();
            }
         }
      }, this);

      if (setting.ExeCommonEvent) {
         if (!isNaN(setting.CallEvent)) {
            $gameTemp.reserveCommonEvent(setting.CallEvent);
         }
      }
      $gameParty.consumeItem(item);
   };

   function Utility() { }
   //回復時に残すかチェック
   Utility.isMarkState = function (id) {
      var dat = $dataStates[id].meta;
      if (dat.ReviveNotClear !== undefined) {
         return true;
      }
      return false;
   };

   //復活アイテムの確認
   Utility.CheckReviveItem = function () {
      var dat = {};
      dat.flag = false;
      $gameParty.items().forEach(function (item) {
         if (item.meta.ReviveItem) {
            dat.flag = true;
            dat.item = item;
         } else {
            return;
         }
      }, this);
      return dat;
   };
})(this);