
// Function to generate a random integer between 0 and 9
function getRandomInt() {
  return Math.floor(Math.random() * 10);
}

// Listen for the "Get Available Address" button click
// Add an event listener to the button with the ID 'getAddressBtn'
document.getElementById('getAddressBtn').addEventListener('click', async () => {

  try {
    let address = localStorage.getItem('userAddress'); // Retrieve the user address from localStorage
    const addressContainer = document.getElementById('addressContainer'); // Get the container element for displaying the address
    addressContainer.style.display = 'block'; // Make the address container visible

    if (!address) {
      // If the user address is not stored in localStorage, perform the following steps:

      // Set the App credentials for authentication
      const credentials = 'u0wk7bviu4:6rFc_Jelo1WVbjMtfbOqQk0GFwK0czb428kgrom1Vgo';
      const encodedCredentials = btoa(credentials);

      // Define the API endpoint to retrieve available addresses
      const url = 'https://u0fa6mg3lo-u0zscxmwe9-connect.us0-aws.kaleido.io/gateways/caribcontract/0x70f10bd254bc76a9d1c7c3c08e9c5c06580f3d20/availableAddresses?input=' + getRandomInt();

      // Make a GET request to the specified URL using fetch
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${encodedCredentials}`, // Include the encoded credentials in the request header
          'Content-Type': 'application/json' // Specify the content type as JSON
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data'); // Throw an error if the response is not successful
      }

      // Parse the response data as JSON
      const data = await response.json();

      // Retrieve the output address from the response
      address = data.output;

      // Store the retrieved address in localStorage for future use
      localStorage.setItem('userAddress', address);
    }

    // Display the retrieved address on the page
    const addressDisplay = document.getElementById('addressDisplay');
    addressDisplay.innerText = address;
  } catch (error) {
    console.error(error);
    // Display error message
    alert('Error getting an address, please try again!');
  }
});



// Add an event listener to the button with the ID 'viewBalanceBtn'
document.getElementById('viewBalanceBtn').addEventListener('click', async () => {
  try {
    const credentials = 'u0wk7bviu4:6rFc_Jelo1WVbjMtfbOqQk0GFwK0czb428kgrom1Vgo';
    const encodedCredentials = btoa(credentials);
    const balanceContainer = document.getElementById('balanceContainer');
    balanceContainer.style.display = 'block'; // Make the balance container visible

    const url = 'https://u0fa6mg3lo-u0zscxmwe9-connect.us0-aws.kaleido.io/gateways/caribcontract/0x70f10bd254bc76a9d1c7c3c08e9c5c06580f3d20/getBalance?lenderAddress=0xc6ba694c95cb2cc8845085f4d39f17b73932d8ba';

    // Make a GET request to retrieve the balance
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`, // Include the encoded credentials in the request header
        'Content-Type': 'application/json' // Specify the content type as JSON
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data'); // Throw an error if the response is not successful
    }

    const data = await response.json();
    const balance = data.output;
    const balanceDisplay = document.getElementById('balanceDisplay');
    balanceDisplay.innerText = `${balance} ETH`; // Display the balance on the page
  } catch (error) {
    console.error(error);
    alert('Error getting balance, please try again!'); // Display error message
  }
});

// Add an event listener to the button with the ID 'borrowFundsBtn'
document.getElementById('borrowFundsBtn').addEventListener('click', () => {
  const borrowFundsForm = document.getElementById('borrowFundsForm');
  borrowFundsForm.style.display = 'block'; // Make the borrow funds form visible
});

// Add an event listener to the button with the ID 'submitBorrowFundsBtn'
document.getElementById('submitBorrowFundsBtn').addEventListener('click', async () => {
  const amount = document.getElementById('amount').value;
  const processingMessage = document.getElementById('processingMessage');
  processingMessage.style.display = 'block'; // Show the processing message

  // Check the authentication state of the user
  firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
      // User is signed in
      const username = user.displayName || user.email; // Get the username or email of the signed-in user
      console.log(username);

      try {
        // Set the App credentials
        const credentials = 'u0wk7bviu4:6rFc_Jelo1WVbjMtfbOqQk0GFwK0czb428kgrom1Vgo';
        const encodedCredentials = btoa(credentials);
        const address = localStorage.getItem('userAddress');
        const addressInput = document.getElementById('address');
        addressInput.value = address;

        // API endpoint to borrow funds
        const url = `https://u0fa6mg3lo-u0zscxmwe9-connect.us0-aws.kaleido.io/gateways/caribcontract/${address}/borrowFunds?kld-from=0xc6ba694c95cb2cc8845085f4d39f17b73932d8ba&kld-ethvalue=${amount}&kld-sync=true`;
        // Call the borrowFunds function with the amount value entered by the user
        // Make a request using fetch
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "amountToBorrow": `${amount}`,
            "borrowerName": `${username}`,
            "lender": "0xc6ba694c95cb2cc8845085f4d39f17b73932d8ba"
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        const txHash = data.transactionHash;

        // Hide the borrow funds form and processing message, and display the transaction hash
        const borrowFundsForm = document.getElementById('borrowFundsForm');
        borrowFundsForm.style.display = 'none';
        processingMessage.style.display = 'none';
        const transactionDisplay = document.getElementById('transactionDisplay');
        transactionDisplay.innerText = `Transaction Hash: ${txHash}`;
        transactionDisplay.style.display = 'block';

        // Add transaction details to the database
        addTransaction(username, amount, txHash);
        console.log('Transaction details added to the database');
      } catch (error) {
        console.error(error);
        // Display error message
        alert('Error borrowing funds, please try again!');
      }
    } else {
      // No user is signed in
      console.log('No user is signed in.');
    }
  });
});


/**
 * Adds a transaction to the Firestore database.
 * @param {string} borrowerName - The name of the borrower.
 * @param {number} amount - The amount of the transaction.
 * @param {string} txHash - The transaction hash.
 */
async function addTransaction(borrowerName, amount, txHash) {
  try {
    const db = firebase.firestore(); // Get the Firestore instance
    const user = firebase.auth().currentUser; // Get the current user
    const userId = user ? user.uid : ''; // Get the user ID if available, otherwise use an empty string
    const timestamp = firebase.firestore.FieldValue.serverTimestamp(); // Get the server timestamp
    const transaction = {
      borrowerName,
      amount,
      txHash,
      userId,
      timestamp
    };

    await db.collection('transactions').add(transaction); // Add the transaction to the 'transactions' collection in Firestore
  } catch (error) {
    console.error(error);
    // Display error message
    alert('Error adding transaction, please try again!');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const getRecentTransactionsBtn = document.getElementById('viewTransactionsBtn');
  const transactionsDisplay = document.getElementById('transactionsDisplay');
  transactionsDisplay.style.display = 'none';
  const transactionsTableBody = document.getElementById('transactionsTableBody');

  /**
   * Retrieves the 10 most recent transactions from Firestore and populates the transactions table.
   */
  function getRecentTransactions() {
    console.log('getRecentTransactions function called');

    // Clear existing rows
    while (transactionsTableBody.firstChild) {
      transactionsTableBody.removeChild(transactionsTableBody.firstChild);
    }

    // Get the 10 most recent transactions from Firestore
    const db = firebase.firestore();
    db.collection('transactions')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get()
      .then((querySnapshot) => {
        console.log('Retrieved data from Firestore:', querySnapshot.docs);
        querySnapshot.forEach((doc) => {
          const transactionData = doc.data();
          console.log('Transaction data:', transactionData);

          // Create new row in the transactions table
          console.log("Creating new row in transactions table");
          const newRow = transactionsTableBody.insertRow();
          const borrowerNameCell = newRow.insertCell();
          const amountCell = newRow.insertCell();
          const transactionHashCell = newRow.insertCell();
          const dateCell = newRow.insertCell();

          // Populate the cells with transaction data
          console.log("Populating transactions table");
          borrowerNameCell.innerHTML = transactionData.borrowerName;
          amountCell.innerHTML = transactionData.amount;
          transactionHashCell.innerHTML = transactionData.txHash;
          dateCell.innerHTML = new Date(transactionData.timestamp.seconds * 1000).toLocaleString();
          console.log("transactions table fully populated");
        });
      })
      .catch((error) => {
        console.error('Error retrieving data from Firestore:', error);
      });
  }

  // Event listener for the "View Transactions" button
  getRecentTransactionsBtn.addEventListener('click', () => {
    transactionsDisplay.style.display = 'block';
    document.querySelector('.table-header-row').style.display = 'table-row';
    getRecentTransactions();
  });

});
