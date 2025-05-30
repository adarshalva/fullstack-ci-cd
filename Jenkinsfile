pipeline {
  agent any
  stages {
    stage('Build Docker Image') {
      steps {
        sh 'docker build -t travelapp .'
      }
    }
    stage('Run Docker Container') {
      steps {
        sh 'docker run -d -p 8080:80 travelapp'
      }
    }
  }
}

