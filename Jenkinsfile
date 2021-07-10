node('python3 && git && jq && (tzdata || !alpine)') {
    String cred_git = 'GitHub'
    String cred_github = 'GitHub-Token'

    String github_account = 'BlackSilverUfa'
    String github_repo = 'BlackSilverUfa-Beta'
    String input_branch = 'master'

    String repo_url = 'git@github.com:' + github_account + '/' + github_repo + '.git'


    stage('Prepare') {
        git branch: input_branch, credentialsId: cred_git, url: repo_url

        sh 'git config --local user.email "the.dr.hax@gmail.com"'
        sh 'git config --local user.name "Jenkins"'

        sh './bsu venv update'

        sshagent (credentials: [cred_git]) {
            sh './bsu data pull'
            sh './bsu pages pull'
        }
    }

    stage('Download Chats') {
        sh './bsu download-chats'
    }

    stage('Build') {
        sh './bsu build'
    }

    stage('Deploy') {
        sh './bsu pages commit'

        sshagent (credentials: [cred_git]) {
            sh './bsu pages push'
        }

        githubNotify(
            status: "SUCCESS",
            credentialsId: cred_github,
            account: github_account,
            repo: github_repo,
            sha: input_branch
        )
    }
}
