const Notify = require("./notify") 
module.exports= function(){
    const notify = Notify()
    let queue = []
    return {
        emit:function(event){
            if(queue)return queue.push(event)
            notify(event)
        },
        listen:function(){
            const source = notify.listen()
            if(queue){
                queue.forEach(notify)
                queue = null
            }
          
            return source
        },
        end:notify.end
    }
}