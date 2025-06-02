pipeline {
    agent any

    tools {
        jdk 'jdk24'
        sonar 'Sonar_Scanner'  // Define SonarScanner tool installation name here
    }

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub'
        IMAGE_NAME = 'adarshalva/fullstack-todo-backend'
        SONAR_PROJECT_KEY = 'fullstack-todo-backend'          // Your SonarQube project key
        SONAR_HOST_URL = 'http://localhost:9000'  // SonarQube server URL (set in Jenkins global config or replace here)
        SONAR_AUTH_TOKEN = credentials('sonar-token')         // Jenkins credential ID for SonarQube token
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/adarshalva/fullstack-ci-cd.git', branch: 'main', credentialsId: 'github-token'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sq1') {
                    script {
                        def scannerHome = tool name: 'Sonar_Scanner'
                        sh """
                            export JAVA_HOME=/opt/java/openjdk
                            export PATH=\$JAVA_HOME/bin:\$PATH
                            export PATH=${scannerHome}/bin:\$PATH
                            sonar-scanner \
                              -Dsonar.projectKey=${env.SONAR_PROJECT_KEY} \
                              -Dsonar.sources=backend \
                              -Dsonar.host.url=${env.SONAR_HOST_URL} \
                              -Dsonar.login=${env.SONAR_AUTH_TOKEN}
                        """
                    }
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan ./backend', odcInstallation: 'DP'
            }
            post {
                always {
                    dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    def app = docker.build("${IMAGE_NAME}:latest", "backend")
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        app.push("latest")
                    }
                }
            }
        }

        stage('Trivy Vulnerability Scan') {
            steps {
                script {
                    sh '''
                        mkdir -p trivy-bin  
                        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b trivy-bin
                        ./trivy-bin/trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_NAME}:latest || true
                    '''
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                sh '''
                    docker stop my-sample-app || true
                    docker rm my-sample-app || true
                    docker run -d -p 4000:4000 --name my-sample-app ${IMAGE_NAME}:latest
                '''
            }
        }
    }
}
