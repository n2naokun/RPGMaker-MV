//=============================================================================
// MultiSoundPlayer.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
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
 * 事前読み込みせずにここで読み込むこともできます。
 * 事前読み込みされていた場合は再生識別子以外のパラメーターは無視されます。
 * 音量は省略出来ます。省略した場合は100%に設定されます。
 * ピッチとパンは固定です。
 * 
 * 音量を変える場合
 * SoundVolume 再生識別子 音量
 * 再生識別子で指定したサウンドの音量を変更します。
 * 
 * 停止する場合
 * StopSound 再生識別子
 * ※停止しただけではデータは削除されません。
 * 　使用しない場合はDelSoundを使用してください。
 * 
 * ※再生識別子とは
 * 　再生中のサウンド自体に付ける名前です。
 * 　これがあることによって同じ名前のファイルも同時再生ができます。
 * 
 * ※指定したファイルが存在しないとエラーが発生します。
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

var ExSoundBuffer = {};
var ExSound = {};
var ExSoundType = {};

(function (_global) {
    mgr = AudioManager;
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

            case "PlaySound":
                Utility.playSound(args[0], args[1], args[2], args[3]);
                break;

            case "StopSound":
                Utility.stopSound(args[0]);
                break;
        }
        Game_Interpreter_pluginCommand.call(this, command, args);
    };

    function Utility() { };
    Utility.setSound = function (soundId, soundType, soundName, volume) {
        // パラメーターが無ければ実行しない
        if (!soundId || !soundType || !soundName) return;

        // サウンドタイプを設定
        if (soundType == "BGM") {
            type = "bgm";
        } else {
            type = "bgs";
        }

        // 古いサウンドバッファを削除
        Utility.delSound(soundId);

        // サウンド情報を構築
        sound = {};
        sound.name = String(soundName);
        sound.pan = 0;
        sound.pitch = 100;

        // ボリュームが指定されていない場合100に固定
        if (!isNaN(Number(volume))) {
            sound.volume = Number(volume).clamp(0, 100);
            console.log(sound.volume);
        } else {
            sound.volume = 100;
        }

        // バッファの作成とパラメーター設定
        ExSoundBuffer[String(soundId)] = mgr.createBuffer(type, sound.name);
        Utility.updateSoundParameters(ExSoundBuffer[String(soundId)], sound, soundType);
        // サウンドの情報の登録
        ExSound[String(soundId)] = Object.assign({}, sound);
        // サウンドタイプの登録
        ExSoundType[String(soundId)] = soundType;
    }

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
    }

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
    }

    Utility.playSound = function (soundId, soundType, soundName, volume) {
        if (ExSoundBuffer[String(soundId)]) {
            ExSoundBuffer[String(soundId)].play(true, 0);
        } else if (soundId && soundType && soundName) {
            Utility.setSound(soundId, soundType, soundName, volume);
            if (ExSoundBuffer[String(soundId)]) {
                ExSoundBuffer[String(soundId)].play(true, 0);
            }
        }
    }

    Utility.stopSound = function (soundId) {
        if (ExSoundBuffer[String(soundId)]) {
            ExSoundBuffer[String(soundId)].stop();
        }
    }

    Utility.updateSoundParameters = function (buffer, sound, soundType) {
        if (soundType == "BGS") {
            mgr.updateBufferParameters(buffer, mgr._bgsVolume, sound);
        } else if (soundType == "BGM") {
            mgr.updateBufferParameters(buffer, mgr._bgmVolume, sound);
        }
    }

    Object.defineProperty(AudioManager, 'bgmVolume', {
        get: function () {
            return this._bgmVolume;
        },
        set: function (value) {
            this._bgmVolume = value;
            this.updateBgmParameters(this._currentBgm);
            // MultiSoundPlayerの音量を変更
            for (soundId in ExSoundType) {
                if (ExSoundType[String(soundId)] == "BGM") {
                    Utility.updateSoundParameters(
                        ExSoundBuffer[String(soundId)],
                        ExSound[String(soundId)],
                        ExSoundType[String(soundId)]);
                }
            }
        },
        configurable: true
    });

    Object.defineProperty(AudioManager, 'bgsVolume', {
        get: function () {
            return this._bgsVolume;
        },
        set: function (value) {
            this._bgsVolume = value;
            this.updateBgsParameters(this._currentBgs);
            // MultiSoundPlayerの音量を変更
            for (soundId in ExSoundType) {
                if (ExSoundType[String(soundId)] == "BGS") {
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