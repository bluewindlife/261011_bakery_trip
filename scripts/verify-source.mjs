import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const html = readFileSync('index.html','utf8');
const script = readFileSync('script.js','utf8');
assert(html.includes('data-trip-date="2026-10-11"'));
assert(html.includes('data-storage="bakery-trip-261011-v1"'));
assert.equal(new Date('2026-10-11T12:00:00+09:00').getUTCDay(),0);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size,ids.length,'duplicate ids');
for (const [,target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target),`missing anchor ${target}`);
for (const [,url] of html.matchAll(/href="(https?:[^"]+)"/g)) new URL(url.replaceAll('&amp;','&'));
const checks = [...html.matchAll(/data-check="([^"]+)"/g)].map(m => m[1]);
assert.equal(checks.length,8); assert.equal(new Set(checks).size,8);
const shops = [...html.matchAll(/data-shop="([^"]+)"/g)].map(m => m[1]);
assert.deepEqual(shops,['shimoda','tanuki','zono','commen']);
const times = [...html.matchAll(/data-plan-time="(\d\d:\d\d)"/g)].map(m => m[1]);
assert.deepEqual(times,[...times].sort(),'timeline must be ordered');
assert(script.includes("timeZone: 'Asia/Tokyo'"));
assert(!html.includes('アールグレイロイヤルミルクティー'),'stale September seasonal product');
assert(!html.includes('data-shop="maru"'),'Sunday-closed shop is scheduled');
console.log('Source checks passed: date, route order, links, anchors, checklist, October product.');

assert.deepEqual([...html.matchAll(/data-candidate="([^"]+)"/g)].map(m=>m[1]),["wakan","kepo","higu","tsubasa","ryumon","ken","maruichi"]);
assert(html.includes("id=\"parking-zono\""));
assert(!html.includes("9/22営業確認"));
assert(!html.includes("ZONOへの新規寄り道は基本ルートに足さない"));

assert(!html.includes("data-shop=\"wakan\""));
assert(html.includes("id=\"parking-wakan\""));
assert(!html.includes("data-check=\"wakan\""));
assert(!script.includes("和甘"));
assert(html.includes("id=\"parking-tanuki\""));

// v1.4: alternatives exclude scheduled shops, and a booked pickup must not be discarded by a clock cutoff.
const candidates=[...html.matchAll(/data-candidate="([^"]+)"/g)].map(m=>m[1]);
assert(!candidates.some(id=>shops.includes(id)));
assert.equal((html.match(/class="candidate-time"/g)||[]).length,7);
assert(html.includes('12時前後訪問・取り置き済み（ご本人確認）'));
assert(html.includes('data-plan-time="12:00"'));
assert(html.includes('data-plan-time="13:20"'));
assert(!html.includes('取り置き未成立'));
assert(!html.includes('12:00までに蔵前へ着けない見込みなら省略'));
assert(!html.includes('ZONOへの12時到着が難しければ省略'));
