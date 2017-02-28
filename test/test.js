let Util = require("../src/listener.js"),
    should = require("should");
    
let listener = new Util(); 

describe(`测试 listener Pub/Sub API 能否正常使用`, ()=> {
    it(`sub 后可以执行 unsub 进行取消事件的绑定！`, () => {
        
        listener.subscribe(`event`,(...param) => {
            throw new  Error(`我不应该被执行`);
        });

        listener.unsubscribe(`event`);
        
        (function () {
            listener.publish(`event`)    
        }).should.throw(`Error: The Event didnt bind !`)
    })

    it(`pub 后 可以执行 sub 绑定的回调函数执行`, ()=> {
        listener.subscribe(`INCRMENT`,(...param) => {
            param.reduce((prev, next) => prev + next).should.equal(10);
        });

        // doing any something

        listener.publish(`INCRMENT`, 1,2,3,4);
    })

    it(`可在一个监听类目中，添加不同的匿名空间`, ()=> {
        listener.subscribe(`event2.add`,(...param) => {
            throw new Error (`我不应该被执行`);
        });

        listener.subscribe(`event2.mul`,(...param) => {
            param.reduce((prev, next) => prev * next).should.equal(6);
        });

        listener.publish(`event2.mul`, 1,2,3)
    })

    it(`当执行一个监听类目后, 所有订阅命名类目都会执行 并且能够获得相同的传入的参数`, () => {
        let arr = [];

        listener.subscribe(`event3.add`,(...param) => {
            arr.push(param.reduce((prev, next) => prev + next));
        });

        listener.subscribe(`event3.mul`,(...param) => {
            arr.push(param.reduce((prev, next) => prev * next));
        });

        listener.publish(`event3`, 1,2,3);

        // 6 + 6
        arr.reduce((p,n) => p + n).should.equal(12);
    })

    it(`发布一个只能执行一次的订阅函数`, ()=> {
        let temp = 0

        listener.subscribe(`event4`, ()=> {
            temp++;
        });

        listener.once(`event4`);

        (() => {
            listener.publish(`event4`);
        }).should.throw(`Error: The Event didnt bind !`);

        temp.should.equal(1);
    })

    it(`实现浅绑定`, () => {
        let data = {
            name: {
                firstName: 'Brown',
                lastName: 'Owen'
            },
            hobby: ['sanguosha', 'movie'],
            address: {
                compony: 'Baidu.Inc',
                info: {
                    compony_address: '上地十街',
                    home_address: 'blablabla'
                }
            }
        }

        let listener = new Util(data);

        listener.watch('name.firstName', {deep: 0}, (val) => {
            // 我改变了我的名字
            return val + 'Blue';
        })

        data.name.firstName = 'Tim';
        data.name.firstName.should.equal('TimBlue');
    })

    it(`实现深绑定`, () => {
        let data = {
            name: {
                firstName: 'Brown',
                lastName: 'Owen'
            },
            hobby: ['sanguosha', 'movie'],
            address: {
                compony: 'Baidu.Inc',
                info: {
                    compony_address: '上地十街',
                    home_address: 'blablabla'
                }
            }
        }

        let listener = new Util(data);

        listener.watch('address', {deep: 1}, (val) => {
            // 我改变了我的地址
            return val + '_wait';
        })

        data.address.compony = 'Tencent';
        data.address.info.compony_address = '南山科技园';

        data.address.compony.should.equal('Tencent_wait');
        data.address.info.compony_address.should.equal('南山科技园_wait');
    })
})