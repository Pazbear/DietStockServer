module.exports = {
    apps: [
        {
            name:'index',
            script : './index.js',
            instances:1,
            exec_mode : 'cluster',
            wait_ready : true,
            listen_timeout:50000,
            error_file : "./error-logs/err.log",
            out_file : "./logs/out.log"
        }
    ]
}