pipeline {
    agent any

    options {
        skipDefaultCheckout()
    }

    environment {
        JAVA_HOME = "/opt/java/openjdk"
        PATH = "${env.JAVA_HOME}/bin:${env.PATH}"
        DOCKER_REGISTRY = "docker.io/adarshalva"
        IMAGE_NAME = "fullstack-app"
        IMAGE_TAG = "latest"
        SONAR_TOKEN = credentials('sonar-token')  // This is fine here
    }

    stages {
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sq1') {
                    script {
                        def scannerHome = tool 'Sonar_Scanner'
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.login=${SONAR_TOKEN}"
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
                    sh """
                        mkdir -p trivy-bin  
                        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b trivy-bin
                        ./trivy-bin/trivy image --exit-code 0 --severity HIGH,CRITICAL ${env.IMAGE_NAME}:latest || true
                    """
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                sh """
                    docker stop my-sample-app || true
                    docker rm my-sample-app || true
                    docker run -d -p 4000:4000 --name my-sample-app ${env.IMAGE_NAME}:latest
                """
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            script {
                sh "docker rm -f ${env.IMAGE_NAME} || true"
            }
        }
    }
}






