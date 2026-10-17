/** dsh-whale-pond — 宿主半侧。
 * 本包不给宿主平面贡献任何东西：浏览器半侧是纯视觉的背景插件，
 * 由客户端模块系统按 package.json 的 dsh.client 声明加载。
 * 空的 apply 让这一行能挂进宿主 Loader，也让 client-modules 的扫描
 * 认出这是一个客户端包。
 */
export function apply() {}
