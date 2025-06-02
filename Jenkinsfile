pipeline {  
    agent any 

    tools { 
        jdk 'jdk22' 
    } 

    environment { 
        SCANNER_HOME = tool 'Sonar_Scanner' 
        DOCKERHUB_CREDENTIALS = 'dockerhub' 
        IMAGE_NAME = 'adarshalva/fullstack-todo-backend' 
    } 

    stages { 
        stage('Checkout') { 
            steps { 
                git url: 'https://github.com/adarshalva/https://github.com/adarshalva/fullstack-ci-cd.git', 
                    branch: 'main', 
                    credentialsId: 'github-token' 
            } 
        } 

        stage('SonarQube Analysis') { 
            steps { 
                withSonarQubeEnv('sq1') { 
                    sh "${SCANNER_HOME}/bin/sonar-scanner"
                } 
            } 
        } 

        stage('OWASP Dependency Check') { 
            steps { 
                dependencyCheck additionalArguments: '--scan ./backend', odcInstallation: 'DP' 
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml' 
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
                        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b trivy-bin v0.62.0 
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

