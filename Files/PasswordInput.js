//=============================================================================
// PasswordInput.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.4 2017/10/28 競合が発生する可能性のあるバグを修正
// 1.0.3 2017/10/19 バグ修正
// 1.0.2 2017/10/19 書き忘れていた処理を追加
// 1.0.1 2017/10/19 説明を一部修正
// 1.0.0 2017/10/19 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc 名前入力画面を流用したパスワード入力画面表示プラグインです。
 * @author n2naokun(柊菜緒)
 *
 * @help プラグインコマンドからパスワード入力画面を表示して入力されたパスワードが
 * プラグインコマンドで設定されたパスワードと同じかをチェックして結果をスイッチに返します。
 * 入力した文字とコマンドから指定した文字が同じ場合スイッチがONになります。
 * 
 * コマンド
 * PasswordInput パスワード スイッチ 最大文字数
 * 例：
 * PasswordInput ひみつ 1 6
 * この場合パスワードはひみつ、結果を返すスイッチは1番、最大文字数は6文字になります。
 * 
 * ※最大文字数は設定されていない場合またはパスワードの文字数より少ない場合は
 * 　パスワードの文字数が最大文字数として使用されます。
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

"use strict";//厳格なエラーチェック

(function (_global) {
   //プラグインコマンド定義
   var Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
   Game_Interpreter.prototype.pluginCommand = function (command, args) {
      switch (command) {
         case "PasswordInput":
            if (args[0] && !isNaN(args[1])) {
               var maxLength = args[0].length;
               if (!isNaN(args[2]) && maxLength < Number(args[2])) {
                  maxLength = Number(args[2]);
               }
               SceneManager.push(Scene_Password);
               SceneManager.prepareNextScene(maxLength, args[0], Number(args[1]));
            }
      }
      Game_Interpreter_pluginCommand.call(this, command, args);
   };

})(this);

//Scene_nameの継承と処理変更
function Scene_Password() {
   this.initialize.apply(this, arguments);
}

Scene_Password.prototype = Object.create(Scene_Name.prototype);

Scene_Password.prototype.constructor = Scene_Password;
Scene_Password.prototype.initialize = function () {
   Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Password.prototype.prepare = function (maxLength, passWord, switchId) {
   this._maxLength = maxLength;
   this._passWord = passWord;
   this._switchId = switchId;
};

Scene_Password.prototype.create = function () {
   Scene_MenuBase.prototype.create.call(this);
   this.createEditWindow();
   this.createInputWindow();
};

Scene_Password.prototype.createEditWindow = function () {
   this._editWindow = new Window_PasswordEdit(this._maxLength);
   this.addWindow(this._editWindow);
};

Scene_Password.prototype.createInputWindow = function () {
   this._inputWindow = new Window_PasswordInput(this._editWindow);
   this._inputWindow.setHandler("ok", this.onInputOk.bind(this));
   this.addWindow(this._inputWindow);
};

Scene_Password.prototype.onInputOk = function () {
   if (this._editWindow.name() == this._passWord) {
      $gameSwitches.setValue(this._switchId, true);
   } else {
      $gameSwitches.setValue(this._switchId, false);
   }
   delete this._actor;
   this.popScene();
};


//Window_NameEditの継承と処理変更
function Window_PasswordEdit() {
   this.initialize.apply(this, arguments);
}

Window_PasswordEdit.prototype = Object.create(Window_NameEdit.prototype);
Window_PasswordEdit.prototype.constructor = Window_PasswordEdit;

Window_PasswordEdit.prototype.initialize = function (maxLength) {
   var width = this.windowWidth();
   var height = this.windowHeight();
   var x = (Graphics.boxWidth - width) / 2;
   var y = (Graphics.boxHeight - (height + this.fittingHeight(9) + 8)) / 2;
   Window_Base.prototype.initialize.call(this, x, y, width, height);
   this._name = "";
   this._index = this._name.length;
   this._maxLength = maxLength;
   this._defaultName = this._name;
   this.deactivate();
   this.refresh();
};

Window_PasswordEdit.prototype.refresh = function () {
   this.contents.clear();
   for (var i = 0; i < this._maxLength; i++) {
      this.drawUnderline(i);
   }
   for (var j = 0; j < this._name.length; j++) {
      this.drawChar(j);
   }
   var rect = this.itemRect(this._index);
   this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
};

Window_PasswordEdit.prototype.left = function () {
   var nameCenter = this.contentsWidth() / 2;
   var nameWidth = this._maxLength * this.charWidth();
   return Math.min(nameCenter - nameWidth / 2, this.contentsWidth() - nameWidth);
};


//Window_NameInputの継承と処理変更
function Window_PasswordInput() {
   this.initialize.apply(this, arguments);
}
Window_PasswordInput.prototype = Object.create(Window_NameInput.prototype);
Window_PasswordInput.prototype.constructor = Window_PasswordInput;

Window_PasswordInput.prototype.onNameOk = function () {
   SoundManager.playOk();
   this.callOkHandler();
};