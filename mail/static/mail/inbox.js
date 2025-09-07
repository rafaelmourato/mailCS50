document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails',{
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body:  document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      document.querySelector('#compose-recipients').value = '';
      document.querySelector('#compose-subject').value = '';
      document.querySelector('#compose-body').value = '';
      load_mailbox('sent')
    })
    return false;
  };
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-show').style.display = 'none';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-show').style.display = 'none';

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    if (emails.length === 0){
      const element = document.createElement('div');
      element.innerHTML = `There are no emails here yet.`;
      document.querySelector('#emails-view').append(element);
    }else{
      // Print emails
      console.log(emails);
      // ... do something else with emails ...
      emails.forEach(function(email) {
        const element = document.createElement('div');
        element.className = `email-div border p-2 ${email.read ? 'bg-light' : 'bg-white'}`;
        element.innerHTML = `
        <span class="sender">${email.sender}</span>
        <span class="subject ml-4">${email.subject}</span>
        <span class="timestamp float-right text-muted">${email.timestamp}</span>`;
        element.addEventListener('click', function() {
          console.log('This element has been clicked!')
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
          show_email(email.id)
        }); 
      document.querySelector('#emails-view').append(element);
      })
    }
  });

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function show_email(id){
  const content = document.querySelector('#emails-show');
  content.innerHTML = '';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // ... do something else with email ...
      const element = document.createElement('div');
      element.innerHTML = `
      <div><strong>From:</strong> ${email.sender}</div> 
      <div><strong>To:</strong> ${email.recipients}</div> 
      <div><strong>Subject:</strong> ${email.subject}</div>
      <div><strong>Date:</strong> ${email.timestamp}</div>
      <div>
        <span><button class="btn btn-sm btn-outline-primary mt-1" id="reply-btn">Reply</button></span>
        <span><button class="btn btn-sm btn-outline-primary mt-1"  id="archive-btn">${email.archived ? 'Unarchive' : 'Archive'}</button></span>
      </div>
      <hr>
      <div><pre>${email.body}</pre></div>`; 
      document.querySelector('#emails-show').append(element);
      document.querySelector('#archive-btn').addEventListener('click', ()=>{
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived  
          })
        })
        .then(()=>{
          load_mailbox('inbox')
        })
      });
      //Reply button is broken, and figure out the archive and reply button.
      document.querySelector('#reply-btn').addEventListener('click', ()=> {
        document.querySelector('#compose-recipients').value = `${email.sender}`;
        let subject = email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`;
        document.querySelector('#compose-subject').value = `${subject}`;
        document.querySelector('#compose-body').value = `\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
        compose_email()
      });
      
  });
  
    // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-show').style.display = 'block';

}