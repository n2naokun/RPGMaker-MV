//=============================================================================
// MultiSoundPlayer.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.3.0 2021/07/16 全停止・全削除、BGM/BGS個別での全停止・全削除を実装
//                  どうして誰もTwitterにリクエストしてくれなかったの……
// 1.2.0 2018/07/02 パンとピッチの設定に対応(旧バージョンとの互換有り)
// 1.1.1 2017/10/28 競合が発生する可能性のあるバグを修正
// 1.1.0 2017/10/22 事前読み込みに対応しました
// 1.0.0 2017/10/22 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc 通常のBGMやBGSとは別に複数のサウンドを同時再生するプラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help 使い方
 * プラグインコマンドから
 * 事前読み込みする場合
 * SetSound 再生識別子 BGM/BGS フォルダに存在するファイル名 音量
 * 音量は省略出来ます。省略した場合は100%に設定されます。
 * セットサウンドであらかじめ読み込んでいた場合PlaySoundで
 * 再生識別子を指定するだけで再生できます。
 * 
 * 読み込みデータを削除する場合
 * DelSound 再生識別子
 * StopSoundを使用した場合でもメモリー上にデータを残し続けるので
 * 使用しなくなった場合DelSoundを実行することをおすすめします。
 * StopSoundを実行せずにDelSoundを実行することもできます。
 * 
 * 再生する場合
 * PlaySound 再生識別子 BGM/BGS フォルダに存在するファイル名 音量
 *  事前読み込みせずにここで読み込むこともできます。
 *  事前読み込みされていた場合は再生識別子以外のパラメーターは無視されます。
 *  音量は省略出来ます。省略した場合は100%に設定されます。
 *  ピッチとパンは固定です。
 * 
 * 音量を変える場合
 * SoundVolume 再生識別子 音量
 *  再生識別子で指定したサウンドの音量を変更します。
 * 
 * パンを変える場合
 * SoundPan 再生識別子 パン
 * 
 * ピッチを変える場合
 * SoundPitch 再生識別子 ピッチ（ツクールよりも広範囲に設定可能）
 * ※あまり極端な値にすると動作の保証ができません（笑）
 *  また、再生中に変更すると最初から再生しなおされます。
 *  SetSoundとPlaySoundの間で変更した方が精神衛生上安全でしょう。
 * 
 * 停止する場合
 * StopSound 再生識別子
 * ※停止しただけではデータは削除されません。
 *  使用しない場合はDelSoundを使用してください。
 * 
 * 全て停止する場合
 * StopAllSound
 * 
 * 全て削除する場合
 * DelAllSound
 * 
 * 全てのBGMを停止する場合
 * StopAllBgm
 * ※ツクール内蔵のBGM再生機能には影響しません。
 * 
 * 全てのBGMを削除する場合
 * DelAllBgm
 * ※ツクール内蔵のBGM再生機能には影響しません。
 *  また、データ本体にも影響はありません。
 * 
 * 全てのBGSを停止する場合
 * StopAllBgs
 * ※ツクール内蔵のBGS再生機能には影響しません。
 * 
 * 全てのBGSを削除する場合
 * DelAllBgs
 * ※ツクール内蔵のBGS再生機能には影響しません。
 *  また、データ本体にも影響はありません。
 *
 * ※再生識別子とは
 *  再生中のサウンド自体に付ける名前です。
 *  これがあることによって同じ名前のファイルも同時再生ができます。
 * 
 * ※指定したファイルが存在しないとエラーが発生します。
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

"use strict";//厳格なエラーチェック

var ExSoundBuffer = {};
var ExSound = {};
var ExSoundType = {};

(function (_global) {
   var mgr = AudioManager;
   //プラグインコマンド定義
   var Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
   Game_Interpreter.prototype.pluginCommand = function (command, args) {
      switch (command) {
         case "SetSound":
            Utility.setSound(args[0], args[1], args[2], args[3]);
            break;

         case "DelSound":
            Utility.delSound(args[0]);
            break;

         case "SoundVolume":
            Utility.soundVolume(args[0], args[1]);
            break;

         case "SoundPan":
            Utility.soundPan(args[0], args[1]);
            break;

         case "SoundPitch":
            Utility.soundPitch(args[0], args[1]);
            break;

         case "PlaySound":
            Utility.playSound(args[0], args[1], args[2], args[3]);
            break;

         case "StopSound":
            Utility.stopSound(args[0]);
            break;

         case "StopAllSound":
            Utility.stopAllSound();
            break;

         case "DelAllSound":
            Utility.delAllSound();
            break;

         case "StopAllBgm":
            Utility.stopAllBgm();
            break;

         case "DelAllBgm":
            Utility.delAllBgm();
            break;

         case "StopAllBgs":
            Utility.stopAllBgs();
            break;

         case "DelAllBgs":
            Utility.delAllBgs();
            break;
      }
      Game_Interpreter_pluginCommand.call(this, command, args);
   };

   function Utility() { }
   Utility.setSound = function (soundId, soundType, soundName, volume) {
      // パラメーターが無ければ実行しない
      if (!soundId || !soundType || !soundName) return;

      var type;
      // サウンドタイプを設定
      if (soundType == "BGM") {
         type = "bgm";
      } else {
         type = "bgs";
      }

      // 古いサウンドバッファを削除
      Utility.delSound(soundId);

      // サウンド情報を構築
      var sound = {};
      sound.name = String(soundName);
      sound.pan = 0;
      sound.pitch = 100;

      // ボリュームが指定されていない場合100に固定
      if (!isNaN(Number(volume))) {
         sound.volume = Number(volume).clamp(0, 100);
      } else {
         sound.volume = 100;
      }

      // バッファの作成とパラメーター設定
      ExSoundBuffer[String(soundId)] = mgr.createBuffer(type, sound.name);
      Utility.updateSoundParameters(ExSoundBuffer[String(soundId)], sound, type);
      // サウンドの情報の登録
      ExSound[String(soundId)] = Object.assign({}, sound);
      // サウンドタイプの登録
      ExSoundType[String(soundId)] = type;
   };

   Utility.delSound = function (soundId) {
      if (ExSoundBuffer[String(soundId)]) {
         // バッファ削除
         ExSoundBuffer[String(soundId)].stop();
         ExSoundBuffer[String(soundId)] = null;
         delete ExSoundBuffer[String(soundId)];
         // サウンド情報の削除
         ExSound[String(soundId)] = null;
         delete ExSound[String(soundId)];
         // サウンドタイプの削除
         ExSoundType[String(soundId)] = null;
         delete ExSoundType[String(soundId)];
      }
   };

   Utility.soundVolume = function (soundId, volume) {
      if (ExSoundBuffer[soundId && String(soundId)] && volume) {
         if (!isNaN(Number(volume))) {
            ExSound[String(soundId)].volume = Number(volume).clamp(0, 100);
         } else {
            return;
         }
         Utility.updateSoundParameters(
            ExSoundBuffer[String(soundId)],
            ExSound[String(soundId)],
            ExSoundType[String(soundId)]);
      }
   };

   Utility.soundPan = function (soundId, pan) {
      if (ExSoundBuffer[soundId && String(soundId)] && pan) {
         if (!isNaN(Number(pan))) {
            ExSound[String(soundId)].pan = Number(pan).clamp(-100, 100);
         } else {
            return;
         }
         Utility.updateSoundParameters(
            ExSoundBuffer[String(soundId)],
            ExSound[String(soundId)],
            ExSoundType[String(soundId)]);
      }
   };

   Utility.soundPitch = function (soundId, pitch) {
      if (ExSoundBuffer[soundId && String(soundId)] && pitch) {
         if (!isNaN(Number(pitch))) {
            ExSound[String(soundId)].pitch = Math.round(pitch);
         } else {
            return;
         }
         Utility.updateSoundParameters(
            ExSoundBuffer[String(soundId)],
            ExSound[String(soundId)],
            ExSoundType[String(soundId)]);
      }
   };

   Utility.playSound = function (soundId, soundType, soundName, volume) {
      if (ExSoundBuffer[String(soundId)]) {
         ExSoundBuffer[String(soundId)].play(true, 0);
      } else if (soundId && soundType && soundName) {
         Utility.setSound(soundId, soundType, soundName, volume);
         if (ExSoundBuffer[String(soundId)]) {
            ExSoundBuffer[String(soundId)].play(true, 0);
         }
      }
   };

   Utility.stopSound = function (soundId) {
      if (ExSoundBuffer[String(soundId)]) {
         ExSoundBuffer[String(soundId)].stop();
      }
   };

   Utility.updateSoundParameters = function (buffer, sound, soundType) {
      if (soundType == "bgm") {
         mgr.updateBufferParameters(buffer, mgr._bgmVolume, sound);
      } else if (soundType == "bgs") {
         mgr.updateBufferParameters(buffer, mgr._bgsVolume, sound);
      }
   };

   Utility.stopAllSound = function () {
      for (var soundId in ExSoundBuffer) {
         this.stopSound(soundId);
      }
   };

   Utility.delAllSound = function () {
      for (var soundId in ExSoundBuffer) {
         this.delSound(soundId);
      }
   };

   Utility.stopAllBgm = function () {
      for (var soundId in ExSoundBuffer) {
         if (ExSoundType[soundId] == "bgm") {
            this.stopSound(soundId);
         }
      }
   };

   Utility.delAllBgm = function () {
      for (var soundId in ExSoundBuffer) {
         if (ExSoundType[soundId] == "bgm") {
            this.delSound(soundId);
         }
      }
   };

   Utility.stopAllBgs = function () {
      for (var soundId in ExSoundBuffer) {
         if (ExSoundType[soundId] == "bgs") {
            this.stopSound(soundId);
         }
      }
   };

   Utility.delAllBgs = function () {
      for (var soundId in ExSoundBuffer) {
         if (ExSoundType[soundId] == "bgs") {
            this.delSound(soundId);
         }
      }
   };

   Object.defineProperty(AudioManager, "bgmVolume", {
      get: function () {
         return this._bgmVolume;
      },
      set: function (value) {
         this._bgmVolume = value;
         this.updateBgmParameters(this._currentBgm);
         // MultiSoundPlayerの音量を変更
         for (var soundId in ExSoundType) {
            if (ExSoundType[String(soundId)] == "bgm") {
               Utility.updateSoundParameters(
                  ExSoundBuffer[String(soundId)],
                  ExSound[String(soundId)],
                  ExSoundType[String(soundId)]);
            }
         }
      },
      configurable: true
   });

   Object.defineProperty(AudioManager, "bgsVolume", {
      get: function () {
         return this._bgsVolume;
      },
      set: function (value) {
         this._bgsVolume = value;
         this.updateBgsParameters(this._currentBgs);
         // MultiSoundPlayerの音量を変更
         for (var soundId in ExSoundType) {
            if (ExSoundType[String(soundId)] == "bgs") {
               Utility.updateSoundParameters(
                  ExSoundBuffer[String(soundId)],
                  ExSound[String(soundId)],
                  ExSoundType[String(soundId)]);
            }
         }
      },
      configurable: true
   });

})(this);