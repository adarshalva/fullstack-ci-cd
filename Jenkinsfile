pipeline {
    agent any

    environment {
        // Java path for SonarQube scanner
        JAVA_HOME = "/opt/java/openjdk"
        PATH = "${env.JAVA_HOME}/bin:${env.PATH}"
        
        // Docker registry info - replace with your values
        DOCKER_REGISTRY = "your-docker-registry"
        IMAGE_NAME = "your-image-name"
        IMAGE_TAG = "latest"

        // SonarQube token stored as Jenkins secret credential (replace 'sonar-token' with your credential ID)
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withEnv(["JAVA_HOME=${env.JAVA_HOME}", "PATH+JAVA=${env.JAVA_HOME}/bin"]) {
                    withSonarQubeEnv('sq1') {
                        sh '/var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/Sonar_Scanner/bin/sonar-scanner -Dsonar.login=${SONAR_TOKEN}'
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
                    // Scan the pushed image using trivy
                    sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
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


