pipeline {
    agent any

    environment {
        JAVA_HOME = "/opt/java/openjdk"
        PATH = "${env.JAVA_HOME}/bin:${env.PATH}"
        DOCKER_REGISTRY = "docker.io/adarshalva"
        IMAGE_NAME = "fullstack-app"
        IMAGE_TAG = "latest"
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('sq1') {
            script {
                def scannerHome = tool 'Sonar_Scanner'
                sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=fullstack-todo-app -Dsonar.sources=. -Dsonar.login=${SONAR_TOKEN}"
            }
        }
    }
}

        stage('Build & Push Docker Image') {
            steps {
                script {
                    docker.withRegistry("https://${env.DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        def appImage = docker.build("${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}")
                        appImage.push()
                    }
                }
            }
        }

        stage('Trivy Vulnerability Scan') {
            steps {
                script {
                    sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    sh "docker rm -f ${env.IMAGE_NAME} || true"
                    sh "docker run -d -p 4000:4000 --name ${env.IMAGE_NAME} ${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh "docker rm -f ${env.IMAGE_NAME} || true"
        }
    }
}




