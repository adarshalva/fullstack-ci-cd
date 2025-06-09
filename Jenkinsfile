pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        IMAGE_NAME = 'adarshalva/fullstack-todo-backend'
        PATH = "/usr/local/bin:/usr/bin:/bin"
        JAVA_HOME = "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/adarshalva/fullstack-ci-cd.git', branch: 'main'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sq1') {
                    sh """
                        ${tool('Sonar_Scanner')}/bin/sonar-scanner \
                        -Dsonar.projectKey=fullstack-ci-cd \
                        -Dsonar.sources=. \
                        -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t ${IMAGE_NAME} .'
                }
            }
        }

        stage('Trivy Vulnerability Scan') {
            steps {
                sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                    -v \$(pwd):/root/.cache/ aquasec/trivy:latest \
                    image --exit-code 1 --severity HIGH,CRITICAL \
                    -f table -o trivy-report.txt ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Run Docker Container') {
            steps {
                sh """
                    docker rm -f fullstack-app || true
                    docker run -d --name fullstack-app -p 8080:8080 ${IMAGE_NAME}:latest
                """
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker rm -f fullstack-app || true'
            archiveArtifacts artifacts: 'trivy-report.txt', fingerprint: true
        }
    }
}



