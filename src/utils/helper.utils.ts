// logging helper class 
class Logs {
    static log:Logs|null=null;
    static getInstance=()=>{
        if(!Logs.log){
            Logs.log=new Logs();
            // delete Logs.constructor;
        }
        return Logs.log;
    };

    /**
     * error logs
     * @param arg
     */
    red=(...arg:any)=>{
       console.log('\x1b[31m',...arg,'\x1b[39m');
    };

    /**
     * success operation logs
     * @param arg
     */
    green=(...arg:any)=>{
        console.log('\x1b[32m',...arg,'\x1b[39m');
    }

    /**
     * general warning logs
     * @param arg
     */
    blue = (...arg: any) => {
        console.log('\x1b[34m', ...arg, '\x1b[39m');
    };

  /**
   * normal logs
   * @param arg
   */
  log = (...arg: any) => {
    console.log(...arg);
  };

  /**
   * error logs
   */
  error = (...arg: any) => {
    console.error(...arg);
  };
}

export const log=Logs.getInstance();