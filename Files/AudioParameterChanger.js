//=============================================================================
// AudioParameterChanger.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.1 2017/10/28 競合の可能性のあるバグを修正
// 1.0.0 2017/10/14 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc 再生中のBGM BGSの音量などの各パラメータを変更できるプラグインです。
 * @author 柊菜緒(n2naokun)
 *
 * @help 
 * プラグインコマンドにて
 * 再生中のどのサウンドのパラメーターを変更するか指定（BGM BGSなど）
 * その後に続きVolume Pitch Panなどを入力後に数値を入れることで変更ができます。
 * ※各種パラメーターは省略可能です。省略した場合は既存のパラメータが入ります。
 * ※ピッチを変更した場合のみ最初から再生されます。
 * 例:
 * BGM Volume 20 Pitch 100 Pan 0
 * BGM Volume 20
 * BGS Pitch 120
 * BGS Volume 30 Pitch 110
 * このように実行する事ができます。
 * また、各種パラメーターの順番は前後しても構いません。
 * 
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

'use strict';//厳格なエラーチェック

(function (_global) {
	//プラグインコマンド定義
	var Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		switch (command) {
			case "BGM":
				if (AudioManager._currentBgm === null) break;
				var bgm = Utility.ParameterProcessor(AudioManager._currentBgm, args);
				AudioManager.updateBgmParameters(bgm);
				break;
			case "BGS":
				if (AudioManager._currentBgs === null) break;
				var bgs = Utility.ParameterProcessor(AudioManager._currentBgs, args);
				AudioManager.updateBgsParameters(bgs);
				break;
		}
		Game_Interpreter_pluginCommand.call(this, command, args);
	};

	function Utility() { };
	Utility.ParameterProcessor = function (InputAudio, args) {
		var audio = InputAudio;
		for (i = 0; i < args.length; i++) {
			//数字の場合は処理を飛ばす
			if (!isNaN(args[i])) continue;
			switch (args[i]) {
				case "Volume":
					if (!isNaN(args[i + 1])) {
						audio.volume = Number(args[i + 1]).clamp(0, 100);
					}
					break;
				case "Pitch":
					if (!isNaN(args[i + 1])) {
						audio.pitch = Number(args[i + 1]).clamp(50, 150);
					}
					break;
				case "Pan":
					if (!isNaN(args[i + 1])) {
						audio.pan = Number(args[i + 1]).clamp(-100, 100);
					}
					break;
			}
		}
		return audio;
	}

})(this);