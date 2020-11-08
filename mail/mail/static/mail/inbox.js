document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_mail;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#single-email').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = '';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // show items in mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      //console.log(emails);
      emails.forEach(
        (email) => {
          console.log(email)
          const element = document.createElement('div');
          if (email.read == 1) {
            element.style.backgroundColor = "rgba(0,0,0,0.08)";
          }
          if (email.read == 0) {
            element.style.backgroundColor = 'white';
          }
          element.innerHTML = `<p id="inside-mail"><strong>${email.sender}</strong> ${email.subject} <div id='timestamp'> ${email.timestamp}</div></p>`;
          //add opening a mail functionality

          element.addEventListener('click', () => single_mail(email["id"], mailbox));
          //color

          document.querySelector('#emails-view').append(element);

        })
    })
}

function send_mail() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    });
  return false
}

function single_mail(id, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email').style.display = 'block';
  document.querySelector('#single-email').innerHTML = '';
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true

    })
  }).then(console.log("w"))
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      //email-buttons
      //reply only for inbox 
      if (mailbox === 'inbox') {
        const reply = document.createElement('button');
        reply.innerHTML = 'reply';
        reply.classList.add("btn-primary");
        reply.addEventListener('click', () => {
          compose_email();
          document.querySelector('#compose-recipients').value = `${email.sender}`
          document.querySelector('#compose-subject').value = `${email.subject}`
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`
        })
        document.querySelector('#single-email').append(reply);


        //archive
        const archive = document.createElement('button');
        archive.innerHTML = 'archive';
        archive.classList.add("btn-primary");
        archive.addEventListener('click', () => {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true,
            })
          }).then(response = () => load_mailbox('inbox'))


          //console.log("w")
        })
        document.querySelector("#single-email").append(archive);
      }
      //for archive mailbox
      //unarchive button
      if (mailbox === "archive") {
        const archive = document.createElement('button');
        archive.innerHTML = 'unarchive';
        archive.classList.add("btn-primary");
        archive.addEventListener('click', () => {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          }).then(respose = () => load_mailbox('inbox'))

        })
        document.querySelector("#single-email").append(archive);


      }
      //email-content
      const element = document.createElement('div');
      element.innerHTML =
        `<p><strong>From:</strong> ${email.sender}</p>
      <p><strong>To:</strong> ${email.recipients}</p>
      <p><strong>Subject :</strong> ${email.subject}</p>
      <p><strong>Timestamp:</strong> ${email.timestamp}</p>
      <hr>
      <p> ${email.body}`
      //console.log(element)
      document.querySelector('#single-email').append(element);


    })


}