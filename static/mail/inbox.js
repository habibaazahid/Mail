document.addEventListener('DOMContentLoaded', function() {
  load_inbox();
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_inbox();
  });
  document.querySelector('#sent').addEventListener('click', () => {
    load_sent();
  });
  document.querySelector('#archived').addEventListener('click', () => load_archived());
  document.querySelector('#compose').addEventListener('click', ()=>{
    compose_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(subject = '', sender = '', body = '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  // get compose form
  document.querySelector('#compose-form').addEventListener('submit', (event)=>{
    event.preventDefault();
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let mail_body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: mail_body
      })
    })
    .then(response => response.json())
    .then(result => {
      if(result.error){
        alert(result.error);
        }
        else{
          load_sent();
        }
    })

  })

})
function load_sent(){
  load_mailbox('sent');
    fetch('emails/sent')
    .then(response => response.json())
    .then(result => {
      showResults(result, 'sent')
    })
}
function load_archived(){
  load_mailbox('archive');
    fetch('emails/archive')
    .then(response => response.json())
    .then(result => {
      showResults(result, 'inbox')
    })
}
function load_inbox(){
  load_mailbox('inbox')
    fetch('emails/inbox')
    .then(response => response.json())
    .then(result => {
      showResults(result, 'inbox');
    })
}
function showResults(result, type){
  const email_view = document.querySelector('#emails-view');
      console.log(result);
      const table = document.createElement('table');
      const tr = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.innerText = 'ID';
      tr.appendChild(th1);
      if (type == 'sent'){
        const th2 = document.createElement('th');
        th2.innerText = 'Recipient';
        tr.appendChild(th2);
      }
      if (type == 'inbox'){
        const th2 = document.createElement('th');
        th2.innerText = 'Sender';
        tr.appendChild(th2);
      }

      const th3 = document.createElement('th');
      th3.innerText = 'Subject';
      tr.appendChild(th3);

      const th4 = document.createElement('th');
      th4.innerText = 'Message';
      tr.appendChild(th4);

      const th5 = document.createElement('th');
      th5.innerText = 'Timestamps';
      tr.appendChild(th5);

      const th6 = document.createElement('th');
      th6.innerText = 'Options';
      tr.appendChild(th6);

      table.appendChild(tr);

      result.forEach(element => {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.innerText = element.id;
        tr.appendChild(td);
        if (type == 'sent'){
          const td2 = document.createElement('td');
          td2.innerText = element.recipients;
          tr.appendChild(td2);
        }else{
          const td2 = document.createElement('td');
          td2.innerText = element.sender;
          tr.appendChild(td2);
        }
        const td3 = document.createElement('td');
        td3.innerText = element.subject;
        tr.appendChild(td3);
        const td4 = document.createElement('td');
        td4.innerText = element.body;
        tr.appendChild(td4);
        const td7 = document.createElement('td');
        td7.innerText = element.timestamp;
        tr.appendChild(td7);
        const td5 = document.createElement('td');
        let button = document.createElement('button');
        button.textContent = "Show Mail";
        button.value = element.id;


        if (element.read){
          tr.style.backgroundColor = 'grey';
        }


        td5.appendChild(button);
        tr.appendChild(td5);
        table.appendChild(tr);
      });
      email_view.append(table);


      // SHOW MAIL
      let showMailButtons = document.querySelectorAll('table button');
      console.log(showMailButtons);
      showMailButtons.forEach(element=> {
        element.addEventListener('click', function(){
            const val = parseInt(element.value);
            fetch(`emails/${val}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: true
              })
            })
            fetch(`emails/${val}`)
            .then(response => response.json())
            .then(result =>{
              email_view.innerHTML = '';
              let para = document.createElement('p');
              para.innerHTML = `<b>From:</b> ${result.sender}<br>`;
              para.innerHTML += `<b>To:</b> ${result.recipients}<br>`;
              para.innerHTML += `<b>Subject:</b> ${result.subject}<br>`;
              // para.innerHTML += `<b>Subject:</b> ${result.archived}<br>`;
              para.innerHTML += `<b>Timestap:</b> ${result.timestamp}<br><hr>`;

              let mail = document.createElement('div');
              mail.innerText = result.body;
              let button = document.createElement('button');
              // REPLY SETUP
              let replyButton = document.createElement('button');
              replyButton.innerText = "Reply";
              replyButton.value = `${result.id}`;

              replyButton.addEventListener('click', ()=> {
                let body = 'On ' + result.timestamp + ' '+ result.sender + ' wrote : ' + result.body;
                if (result.subject.startsWith('RE: ')){
                  compose_email(result.subject, result.sender, body);
                }else{
                  compose_email('RE: '+result.subject, result.sender, body);
                }
              })

              
              if (type == 'sent'){
                button.style.display = 'None';
                replyButton.style.display = 'None';
              }
              if (result.archived){
                button.classList.add('unarchive');
                button.textContent = 'Unarchive';
              }else{
                button.classList.add('archive');
                button.textContent = 'Archive';
              }
              button.value = result.id;
              
              email_view.appendChild(para);
              email_view.appendChild(replyButton);
              email_view.appendChild(button);
              email_view.appendChild(mail);

              // ARCHIVE
             button.addEventListener('click', (event)=>{
              let mail_to_archive = this.value;
              console.log(event.target.classList)
              if (event.target.classList.contains('archive')){
                fetch(`emails/${mail_to_archive}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    archived: true,
                  })
                })
                .then(response => {
                  alert('Email Archived');
                  load_inbox();
                })
              }
              else{
                fetch(`emails/${mail_to_archive}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    archived: false,
                  })
                })
                .then(response => {
                  alert('Email Unarchived');
                  load_inbox();
                })
              }
             })
              



            })
          }
        )
      })
}
