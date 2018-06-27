"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const fs = require("fs");
class BookmarkDecorator {
    constructor(context, configuration) {
        this.context = context;
        this.configuration = configuration;
    }
    getPathIcon() {
        let pathIcon = this.configuration.get("gutterIconPath", "");
        if (pathIcon !== "") {
            if (!fs.existsSync(pathIcon)) {
                vscode_1.window.showErrorMessage('The file "' + pathIcon + '" used for "bookmarks.gutterIconPath" does not exists.');
                pathIcon = this.context.asAbsolutePath("images/bookmark.svg");
            }
        }
        else {
            pathIcon = this.context.asAbsolutePath("images/bookmark.svg");
        }
        return pathIcon;
    }
    getOverviewRulerColor() {
        return "rgba(21, 126, 251, 0.7)";
    }
    // private getBackgroundColor(): vscode.ThemeColor {
    //     // "colors": [
    //     //     {
    //     //         "id": "bookmarks.lineBackgroundColor",
    //     //         "description": "Specifies the background color of bookmarked lines",
    //     //         "defaults": {
    //     //             "dark": "editor.background",
    //     //             "light": "editor.background",
    //     //             "highContrast": "editor.background"
    //     //         }
    //     //     }
    //     // ],
    //     return new vscode.ThemeColor('bookmarks.lineBackgroundColor');
    // }
    getBackgroundColor() {
        let bgDark = this.configuration.get("lineBackgroundColor", "");
        if (!bgDark) {
            undefined;
        }
        let bgDarkMatch;
        // RGBA
        const REGEX_RGBA = "rgba\\(\\s*(?:(?:\\d{1,2}|1\\d\\d|2(?:[0-4]\\d|5[0-5]))\\s*,?\\s?){3},\\s?(?:0\\.[1-9]|1(?:\\.0)?)\\s?\\)$/i";
        bgDarkMatch = bgDark.match(REGEX_RGBA);
        if (bgDarkMatch && bgDarkMatch.length === 0) {
            bgDark = undefined;
        }
        else {
            // HEX
            const REGEX_HEX = "#[0-9A-F]{3}([0-9A-F]{3})?/i";
            bgDarkMatch = bgDark.match(REGEX_HEX);
            if (bgDarkMatch && bgDarkMatch.length === 0) {
                bgDark = undefined;
            }
            else {
                return bgDark;
            }
        }
    }
    getDecoration() {
        return {
            gutterIconPath: this.getPathIcon(),
            overviewRulerLane: vscode_1.OverviewRulerLane.Full,
            overviewRulerColor: this.getOverviewRulerColor(),
            backgroundColor: this.getBackgroundColor(),
            isWholeLine: this.getBackgroundColor() !== undefined,
        };
    }
    ;
}
exports.BookmarkDecorator = BookmarkDecorator;
//# sourceMappingURL=Decorator.js.map