export const toMysqlFriendlyDatetime = (datetimeString) => {
    return new Date(datetimeString).toISOString().slice(0, -1);
}