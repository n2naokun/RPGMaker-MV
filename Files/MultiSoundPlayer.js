//=============================================================================
// MultiSoundPlayer.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/10/22 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc 通常のBGSとは別に複数のサウンドを再生するプラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help 使い方
 * プラグインコマンドから
 * 再生する場合
 * PlaySound 再生識別子 BGSフォルダに存在するファイル名 音量
 * 音量は省略出来ます。省略した場合は100%に設定されます。
 * ピッチとパンは固定です。
 * 
 * 停止する場合
 * StopSound 再生識別子
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

ExSoundBuffer = {};

(function (_global) {
    mgr = AudioManager;
    //プラグインコマンド定義
    var Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        switch (command) {
            case "PlaySound":
                Utility.playSound(args[0], args[1], args[2]);
                break;

            case "StopSound":
                Utility.stopSound(args[0]);
                break;
        }
        Game_Interpreter_pluginCommand.call(this, command, args);
    };

    function Utility() { };
    Utility.playSound = function (soundId, bgsName, volume) {
        bgs = {};
        bgs.name = String(bgsName);
        bgs.pan = 0;
        bgs.pitch = 100;
        if (!isNaN(Number(volume))) {
            bgs.volume = Number(volume).clamp(0, 100);
        } else {
            bgs.volume = 100;
        }
        Utility.stopSound(soundId);
        ExSoundBuffer[String(soundId)] = mgr.createBuffer("bgs", bgs.name);
        Utility.updateSoundParameters(ExSoundBuffer[String(soundId)], bgs);
        ExSoundBuffer[String(soundId)].play(true, 0);
    }

    Utility.stopSound = function (soundId) {
        if (ExSoundBuffer[String(soundId)]) {
            ExSoundBuffer[String(soundId)].stop();
            ExSoundBuffer[String(soundId)] = null;
            delete ExSoundBuffer[String(soundId)];
        }
    }

    Utility.updateSoundParameters = function (buffer, bgs) {
        mgr.updateBufferParameters(buffer, mgr._bgsVolume, bgs);
    }
})(this);