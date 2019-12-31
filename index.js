
const urlProducts = 'http://maz.by/ru/products/';
const url = 'http://maz.by';
const scrapeIt = require("scrape-it");
const base64Img = require('base64-img');
let items = [];
let categoriess = [{url: "/ru/products/trailers/"},{url: "/ru/products/passenger_vehicle/"}];

scrapeIt(urlProducts, {
    categories: {
        listItem: ".b-menu_left li",
        name: 'categories',
        data:{
            title: 'a',
            url:{selector: 'a',attr: 'href'}
        }
    }
}).catch((er)=>console.log('Er0',er))
    .then(({data,response})=> {
        console.log('data 1',data);

        new Promise ((resolve, reject)=>{

        for(let pt of data.categories){
            const encoded = encodeURI(pt.url);
            console.log(encoded);
            scrapeIt(url+encoded,{
                items:{
                listItem: '.art-list li',
                name: 'arts',
                data: {
                    title: 'a',
                    url: {selector: 'a', attr: 'href'}
                }
                }
            }).then(({data,response})=>{
                categoriess = [...categoriess,...data.items]
                if (categoriess.length>=29)
                    resolve();
                console.log(categoriess)
                }
            );
        }
        }).then(() => {
            console.log('New start')
            let categories = categoriess;
            for(let category of  categories){
                const encoded = encodeURI(category.url);
                scrapeIt(url+encoded, {
                    itemsByTabs: {
                        listItem: '.tabs div .b-catalog__item',
                        name: 'tab',
                        categories: 'h1',
                        data: {
                            title: '.b-cit__item a',
                            url: {selector: 'a',attr: 'href'},
                        }
                    }
                }).catch((er)=>console.log('Er1',er)).then(({data,response}) =>{
                    let itemsByTabs = [...data.itemsByTabs];
                    for(let item of itemsByTabs){
                        const encoded = encodeURI(item.url);
                        console.log(`${url}/${encoded}`);
                        scrapeIt(url+encoded,{
                            title: 'h1',
                            image: {selector:'.b-c__pic img', attr:'src'},
                            description: '.b-catalog p',
                            category: '.crumbs a:nth-child(5n)',
                            features: {
                                listItem: 'table tr',
                                data: {
                                    text: 'td'
                                }
                            }
                        }).catch((er)=>console.log('Er2',er)).then(({data,response})=>{
                            //console.log('data3',data)
                            if(data){
                                const encoded = encodeURI(data.image);
                                base64Img.requestBase64(url+encoded,function (err,res,body) {
                                    items.push({...data, image: body});
                                    console.log(items)
                                });}
                        }).catch((er)=>console.log('Er3',er))
                    }
                })
            }
        });
    });

