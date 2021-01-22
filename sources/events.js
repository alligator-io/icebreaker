var Notify = require("./notify") 
module.exports= function(){
    var notify = Notify()
    var queue = []
    return {
        emit:function(event){
            if(queue)return queue.push(event)
            notify(event)
        },
        listen:function(){
            var source = notify.listen()
            if(queue){
                queue.forEach(notify)
                queue = null
            }
          
            return source
        },
        end:notify.end
    }
}