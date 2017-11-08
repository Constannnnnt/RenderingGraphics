import axios from 'axios'

class ServerAPI {
  static downloadShader (filename) {
    return axios.post('/api/download/shader', {
      filePath: 'src/shaders/' + filename
    })
      .then(function (res) {
        return Promise.resolve(res.data)
      })
      .catch(function (err) {
        console.error('downloadShader', err)
        return Promise.reject(err)
      })
  }
}

export default ServerAPI
