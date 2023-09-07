const fetchDataFromTable = async (db, table, isSQLite) => {
    let query;
    if (isSQLite) {
      query = `SELECT * FROM ${table}`;
      return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
          if (err) reject(err);
          if (rows.length > 0 && Object.keys(rows[0]).some(key => isNaN(key))) {
            rows.shift();
          }
          resolve(rows);
        });
      });
    } else {
      query = `SELECT * FROM ${table}`;
      return new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) reject(err);
          resolve(result.rows);
        });
      });
    }
  };
  
  const checkTableExists = (db, table, isSQLite) => {
    return new Promise((resolve, reject) => {
        let query;
        if (isSQLite) {
            query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`;
            db.all(query, (err, rows) => {
                if (err) reject(err);
                resolve(rows.length > 0);
            });
        } else {
            query = `SELECT to_regclass('${table}')`;
            db.query(query, (err, result) => {
                if (err) reject(err);
                resolve(result.rows[0].to_regclass !== null);
            });
        }
    });
  };
  
  module.exports = {
    fetchDataFromTable,
    checkTableExists
  };