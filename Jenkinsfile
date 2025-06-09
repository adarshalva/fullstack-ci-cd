pipeline {
    agent any
    
    options {
        skipDefaultCheckout()
    }

    environment {
        JAVA_HOME = "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home" // set your actual Java 21 path here
        PATH = "${env.JAVA_HOME}/bin:/usr/local/bin:${env.PATH}"
        DOCKER_REGISTRY = "docker.io/adarshalva"
        IMAGE_NAME = "fullstack-app"
        IMAGE_TAG = "latest"
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
                withSonarQubeEnv('sq1') {
                    script {
                        def scannerHome = tool 'Sonar_Scanner'
                        sh """${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=fullstack-app \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${env.SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_TOKEN}
                        """
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
                        ./trivy-bin/trivy image --exit-code 0 --severity HIGH,CRITICAL ${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG} || true
                    """
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                sh """
                    docker stop my-sample-app || true
                    docker rm my-sample-app || true
                    docker run -d -p 4000:4000 --name my-sample-app ${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}
                """
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            script {
                sh "docker rm -f my-sample-app || true"
            }
        }
    }
}






