export default function tinyStub(func){
  var stubWrapper = function(){
    return (stubWrapper.calls.push(arguments) && func) ? func.apply(this, arguments) : undefined
  }
  stubWrapper.calls=[]
  return stubWrapper
}
