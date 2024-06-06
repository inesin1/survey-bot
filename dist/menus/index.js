"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMenu = void 0;
const admin_1 = require("./admin");
const useMenu = () => {
    return {
        useAdminMenu: admin_1.useAdminMenu
    };
};
exports.useMenu = useMenu;
