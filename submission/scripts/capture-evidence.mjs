import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];const errors=[];
const check=(ok,label)=>{if(!ok)throw new Error(label);results.push(label)};
for(const [version,port] of [['before',5181],['after',5180]]){
 const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${port}`);await page.getByRole('heading',{name:/Latest notices/}).waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.getByLabel('Report status').selectOption('found');
 await page.screenshot({path:`evidence/screenshots/${version}-collection.png`,fullPage:true});
 await page.getByLabel('Search items').fill('zzznomatch');
 await page.screenshot({path:`evidence/screenshots/${version}-search.png`,fullPage:true});
 if(version==='after'){check(await page.getByRole('heading',{name:'No matching reports'}).isVisible(),'Empty search displays recovery guidance');await page.getByRole('button',{name:'Clear all filters'}).last().click();check(await page.locator('article').count()===13,'Clear filters restores 13 reports');}
 await page.getByRole('button',{name:'+ Post a report'}).click();await page.getByRole('button',{name:'Publish notice'}).click();
 await page.screenshot({path:`evidence/screenshots/${version}-validation.png`,fullPage:true});
 if(version==='after'){
 check((await page.getByRole('alert').innerText()).includes('Title must be at least 2 characters.'),'Invalid submission shows specific title error');
 await page.getByLabel('Item title').fill('Green umbrella');await page.getByLabel('Status',{exact:false}).selectOption('found');await page.getByLabel('Category',{exact:false}).selectOption('other');await page.getByLabel('Last known location').fill('Gate 1');await page.getByLabel('More details').fill('Green umbrella with a wooden handle.');await page.getByRole('button',{name:'Publish notice'}).click();
 check(await page.getByRole('heading',{name:'Green umbrella',exact:true}).isVisible(),'Found report publishes successfully');
 await page.screenshot({path:'evidence/screenshots/successful-report.png',fullPage:true});
 await page.reload();check(await page.getByRole('heading',{name:'Green umbrella',exact:true}).isVisible(),'Report persists after reload');
 await page.getByRole('button',{name:'+ Post a report'}).click();await page.getByLabel('Item title').fill('Green umbrella');await page.getByLabel('Status',{exact:false}).selectOption('found');await page.getByLabel('Category',{exact:false}).selectOption('other');await page.getByLabel('Last known location').fill('Gate 1');await page.getByRole('button',{name:'Publish notice'}).click();check((await page.getByRole('alert').innerText()).includes('same title'),'Duplicate title and location are rejected');check(await page.getByLabel('Item title').inputValue()==='Green umbrella','Failed submission preserves entries');await page.screenshot({path:'evidence/screenshots/duplicate-rejected.png',fullPage:true});
 await page.getByRole('button',{name:'Go back',exact:true}).click();await page.getByRole('button',{name:'Actions for Green umbrella',exact:true}).click();await page.getByRole('button',{name:'Edit your report'}).click();await page.getByLabel('Item title').fill('Green travel umbrella');await page.getByRole('button',{name:'Save report'}).click();check(await page.getByRole('heading',{name:'Green travel umbrella',exact:true}).isVisible(),'Own report can be edited');
 await page.getByRole('button',{name:'Actions for Dark backpack',exact:true}).click();check(await page.getByText('Reported by another student', {exact:true}).isVisible(),'Other students reports do not offer editing');
 await page.getByLabel('Search items').fill('backpack');await page.getByLabel('Report status').selectOption('found');check(await page.locator('article').count()===1,'Search and status filters combine');await page.getByLabel('Item category').selectOption('electronics');check(await page.locator('article').count()===0,'Category filter combines with search and status');
 await page.getByRole('button',{name:'Clear all filters'}).last().click();await page.setViewportSize({width:390,height:844});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile board fits viewport');await page.screenshot({path:'evidence/screenshots/mobile-board.png',fullPage:true});await page.getByRole('button',{name:'+ Post a report'}).click();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile form fits viewport');await page.screenshot({path:'evidence/screenshots/mobile-form.png',fullPage:true});
 }
 await page.close();
}
check(errors.length===0,'No browser JavaScript errors');fs.writeFileSync('evidence/test-results.json',JSON.stringify({results,errors},null,2));await browser.close();console.log(results.join('\n'));
